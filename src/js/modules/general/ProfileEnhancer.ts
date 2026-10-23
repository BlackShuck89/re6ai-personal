import { PageDefinition } from "../../components/data/Page";
import { RE6Module, Settings } from "../../components/RE6Module";

/**
 * An opt-in enhancement of the e6AI user profile favorites/uploads layout.
 *
 * Inspired by re621 2.x's ProfileEnhancer, but scoped to the legacy module
 * system and adapted without mutating profile content or moving DOM nodes.
 */
export class ProfileEnhancer extends RE6Module {

  public constructor () {
    super(PageDefinition.profile, true);
  }

  protected getDefaultSettings (): Settings {
    return {
      // Opt-in: preserve the current e6AI profile design on existing installs.
      enabled: false,
    };
  }

  public create (): void {
    super.create();
    this.updateLayout(true);
  }

  public destroy (): void {
    this.updateLayout(false);
    super.destroy();
  }

  private updateLayout (enabled: boolean): void {
    // No layout changes on other pages, user edit forms, or unsupported markup.
    const $profile = $("#c-users #a-show");
    const supported = $profile.find(".user-favorites, .user-uploads").length > 0;
    $("body").attr("data-re6ai-profile-enhancer", String(enabled && supported));
  }

}
