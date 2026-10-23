import { XM } from "../api/XM";
import { GMxmlHttpRequestResponse } from "../api/XMConnect";
import { Debug } from "./Debug";
import { ErrorHandler } from "./ErrorHandler";
import { Util } from "./Util";

export class VersionChecker {

  public static scriptBuild = "0.0.1";        // actual, hard-coded version of the script

  public static latestBuild = "0.0.1";        // version of the latest release on github

  public static cachedBuild = "0.0.1";        // cached version of the script

  public static wasUpdated = false;           // the script has been updated - `currentBuild` and `scriptBuild` do not match

  public static hasUpdate = false;            // new version is available - `currentBuild` and `latestBuild` do not match

  public static lastUpdated = 0;               // last time the script pinged github to check for a new version

  public static changesText = "_~ Changelog not available ~_";

  public static changesHTML = "";

  public static async init (): Promise<any> {

    // Load the hard-coded script version
    // For debugging purposes it can be emulated via a localStorage value
    const emVersion = Util.LS.getItem("re621.version");
    VersionChecker.scriptBuild = emVersion ? emVersion : window["re621"]["version"];

    // Load settings
    const settings: VersionSettings = await XM.Storage.getValue("re621.VersionChecker", {});
    if (settings.latestBuild !== undefined) VersionChecker.latestBuild = settings.latestBuild;
    if (settings.cachedBuild !== undefined) VersionChecker.cachedBuild = settings.cachedBuild;

    if (VersionChecker.cachedBuild !== VersionChecker.scriptBuild) VersionChecker.wasUpdated = true;
    if (VersionChecker.compareVersions(VersionChecker.cachedBuild, VersionChecker.latestBuild) < 0) VersionChecker.hasUpdate = true;

    if (settings.lastUpdated !== undefined) VersionChecker.lastUpdated = settings.lastUpdated;
    if (settings.changesText !== undefined) VersionChecker.changesText = settings.changesText;

    // If this is a dev build, version checking is skipped
    // Otherwise, either the script version mismatch has been detected, or an hour has passed since last check
    if (VersionChecker.scriptBuild.includes("dev")) {
      VersionChecker.wasUpdated = false;
      VersionChecker.hasUpdate = false;
    } else if (VersionChecker.wasUpdated || VersionChecker.lastUpdated + Util.Time.HOUR < Util.Time.now()) {
      try {
        // GitHub's /releases/latest endpoint excludes prereleases. Query the
        // release collection so beta builds can also find subsequent beta releases.
        const releaseData = await VersionChecker.getGithubData("latest");
        const releases = Array.isArray(releaseData) ? releaseData : [releaseData];
        const available = releases.filter((release) =>
          !release.draft && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(VersionChecker.releaseVersion(release)),
        );
        available.sort((a, b) => VersionChecker.compareVersions(VersionChecker.releaseVersion(b), VersionChecker.releaseVersion(a)));
        const latestRelease = available[0];
        if (!latestRelease) throw "No valid GitHub releases found";
        const releaseVersion = VersionChecker.releaseVersion(latestRelease);

        VersionChecker.latestBuild = releaseVersion;
        VersionChecker.cachedBuild = VersionChecker.scriptBuild;

        VersionChecker.hasUpdate = VersionChecker.compareVersions(VersionChecker.scriptBuild, VersionChecker.latestBuild) < 0;

        VersionChecker.lastUpdated = Util.Time.now();
        VersionChecker.changesText = latestRelease.body || "_~ Changelog not available ~_";
      } catch (error) {
        VersionChecker.latestBuild = "0.0.1";
        VersionChecker.cachedBuild = VersionChecker.scriptBuild;

        VersionChecker.hasUpdate = false;

        VersionChecker.lastUpdated = Util.Time.now();
        VersionChecker.changesText = "Unable to fetch changelog";

        ErrorHandler.error("VersionChecker", "Failed to fetch update data from GitHub.\n" + error);
      }
    }

    VersionChecker.changesHTML = Util.quickParseMarkdown(VersionChecker.changesText);

    Debug.table({
      scriptBuild: VersionChecker.scriptBuild,
      latestBuild: VersionChecker.latestBuild,
      cachedBuild: VersionChecker.cachedBuild,

      wasUpdated: VersionChecker.wasUpdated,
      hasUpdate: VersionChecker.hasUpdate,

      lastUpdated: VersionChecker.lastUpdated,
    });

    await XM.Storage.setValue("re621.VersionChecker", {
      latestBuild: VersionChecker.latestBuild,
      cachedBuild: VersionChecker.cachedBuild,
      lastUpdated: VersionChecker.lastUpdated,
      changesText: VersionChecker.changesText,
    });
  }

  /** Normalize a release tag for update comparisons. */
  private static releaseVersion (release: any): string {
    return String(release?.tag_name || release?.name || "").replace(/^v/, "");
  }

  /** Compare numeric semantic versions and beta/rc prereleases. */
  private static compareVersions (a: string, b: string): number {
    const parse = (value: string) =>
      /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(value);
    const lhs = parse(a), rhs = parse(b);
    if (!lhs || !rhs) return 0;

    for (let i = 1; i <= 3; i++) {
      const diff = Number(lhs[i]) - Number(rhs[i]);
      if (diff !== 0) return Math.sign(diff);
    }
    if (!lhs[4] && !rhs[4]) return 0;
    if (!lhs[4]) return 1; // Stable is newer than its prerelease.
    if (!rhs[4]) return -1;
    const aParts = lhs[4].split("."), bParts = rhs[4].split(".");
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      if (i >= aParts.length) return -1;
      if (i >= bParts.length) return 1;
      const aNumeric = /^\d+$/.test(aParts[i]);
      const bNumeric = /^\d+$/.test(bParts[i]);
      if (aNumeric && bNumeric) {
        const diff = Number(aParts[i]) - Number(bParts[i]);
        if (diff !== 0) return Math.sign(diff);
      } else if (aNumeric !== bNumeric) {
        return aNumeric ? -1 : 1;
      } else if (aParts[i] !== bParts[i]) {
        return aParts[i] < bParts[i] ? -1 : 1;
      }
    }
    return 0;
  }

  /**
   * Fetches the release data from Github's API
   * @param node Version number, or "latest"
   */
  private static async getGithubData (node: string): Promise<any> {
    const url = "https://api.github.com/repos/BlackShuck89/re6ai-personal/releases"
      + (node === "latest" ? "?per_page=30" : "/" + node);
    return XM.Connect.xmlHttpPromise({ url, method: "GET" }).then(
      (response: GMxmlHttpRequestResponse) => { return Promise.resolve(JSON.parse(response.responseText)); },
      () => {
        console.error("Failed to fetch Github release data");
        return {
          name: "0.0.0",
          body: "Error: Unable to fetch the changelog",
        };
      },
    );
  }

}

interface VersionSettings {
  latestBuild: string;
  cachedBuild: string;
  lastUpdated: number;
  changesText: string;
}
