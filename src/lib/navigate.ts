import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

type RouterLike = ReturnType<typeof useRouter>;

// CMS link strings (from HeroSlider.buttonLink, PromoBanner.buttonLink, etc.)
// may be absolute URLs or relative web paths. Route them sensibly:
//  - http(s)://... -> open in in-app browser
//  - /p/{slug}, /c/{slug}, /browse/{filter} -> push to matching mobile route
//  - other relative paths -> ignore (no mobile equivalent yet)
export function openCmsLink(router: RouterLike, link?: string | null) {
  if (!link) return;
  if (/^https?:\/\//i.test(link)) {
    void WebBrowser.openBrowserAsync(link);
    return;
  }
  if (link.startsWith('/p/') || link.startsWith('/c/') || link.startsWith('/browse/')) {
    router.push(link as never);
  }
}
