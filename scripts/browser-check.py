"""Optional real-browser verification. Use installed Mullvad in a disposable profile.
Dependencies: selenium; no browser download or credential/profile reuse.
Example: python scripts/browser-check.py --browser <mullvad.exe> --driver <geckodriver.exe> --output <outside-repo-dir>
"""

import argparse
import json
import os
import re
from pathlib import Path
from urllib.parse import quote, urlparse

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.support.ui import WebDriverWait

p = argparse.ArgumentParser()
p.add_argument("--browser", required=True)
p.add_argument("--driver", required=True)
p.add_argument("--output", required=True)
p.add_argument("--base", default="http://127.0.0.1:4311/")
p.add_argument("--scratch", required=True)
a = p.parse_args()
out = Path(a.output)
out.mkdir(parents=True, exist_ok=True)
for key in ["TEMP", "TMP", "TMPDIR"]:
    os.environ[key] = a.scratch
options = Options()
options.binary_location = a.browser
options.add_argument("-headless")
options.set_preference("network.proxy.type", 0)
options.set_preference("privacy.resistFingerprinting", False)
d = webdriver.Firefox(
    options=options, service=Service(a.driver, log_output=str(out / "geckodriver.log"))
)
w = WebDriverWait(d, 30)
d.set_window_size(1400, 1200)
axe = (
    Path(__file__).resolve().parents[1] / "node_modules/axe-core/axe.min.js"
).read_text(encoding="utf-8")
report = {
    "browser_executable": a.browser,
    "browser_capabilities": {
        "name": d.capabilities["browserName"],
        "version": d.capabilities["browserVersion"],
    },
    "base": a.base,
    "boundary": "Real static production export; mobile widths use an iframe around the unchanged page, not native-device execution. Disposable profile, direct loopback network, resistFingerprinting disabled.",
    "checks": [],
    "captures": [],
}
routes = {
    "de": ["", "datenschutz/", "impressum/", "agb/"],
    "en": ["", "privacy/", "imprint/", "terms/"],
}


def open_page(lang, route, width):
    url = a.base + lang + "/" + route
    # Mullvad minimum outer-window sizes do not guarantee mobile content sizes.
    wrapper = f'<!doctype html><html><head><meta charset="utf-8"><title>Viewport fixture</title></head><body style="margin:0"><iframe id="page" title="Actual website under test" src="{url}" style="display:block;border:0;width:{width}px;height:1000px"></iframe></body></html>'
    d.get("data:text/html;charset=utf-8," + quote(wrapper))
    d.switch_to.frame("page")
    w.until(lambda d: d.execute_script("return document.readyState") == "complete")
    w.until(lambda d: d.find_elements("tag name", "h1"))
    return url


def capture(name):
    d.switch_to.default_content()
    d.find_element("id", "page").screenshot(str(out / name))
    report["captures"].append(name)
    d.switch_to.frame("page")


def glyph_contrast(results):
    selectors = [
        node["target"][0]
        for rule in results.get("incomplete", [])
        if rule["id"] == "color-contrast"
        for node in rule["nodes"]
    ]
    samples = d.execute_script(
        """return arguments[0].map(selector=>{const element=document.querySelector(selector);const foreground=getComputedStyle(element).color;let background='';let opacity=1;for(let node=element;node;node=node.parentElement){const style=getComputedStyle(node);opacity*=Number(style.opacity);if(!background && style.backgroundColor!=='rgba(0, 0, 0, 0)' && style.backgroundColor!=='transparent')background=style.backgroundColor;}return {selector,foreground,background,opacity};});""",
        selectors,
    )

    def luminance(color):
        values = [float(x) for x in re.findall(r"[\d.]+", color)]
        assert len(values) == 3 or (len(values) == 4 and values[3] == 1), color
        rgb = [x / 255 for x in values[:3]]
        linear = [
            x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in rgb
        ]
        return sum(x * y for x, y in zip(linear, [0.2126, 0.7152, 0.0722]))

    for sample in samples:
        assert sample["opacity"] == 1, sample
        first, second = luminance(sample["foreground"]), luminance(sample["background"])
        sample["ratio"] = (max(first, second) + 0.05) / (min(first, second) + 0.05)
        assert sample["ratio"] >= 3, sample
    return samples


try:
    for lang in ["de", "en"]:
        for route in routes[lang]:
            for width in [320, 360, 430, 768, 1280] if not route else [360, 1280]:
                url = open_page(lang, route, width)
                metrics = d.execute_script(
                    """return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,lang:document.documentElement.lang,cookie:document.cookie,resources:performance.getEntriesByType('resource').map(e=>({name:e.name,duration:e.duration,bytes:e.transferSize})),imageErrors:[...document.images].filter(e=>e.loading!=='lazy' && (!e.complete || !e.naturalWidth)).map(e=>e.src),nav:performance.getEntriesByType('navigation').map(e=>({responseEnd:e.responseEnd,domContentLoaded:e.domContentLoadedEventEnd,load:e.loadEventEnd}))}"""
                )
                assert metrics["width"] == width, metrics
                assert metrics["scrollWidth"] <= width, {"url": url, "metrics": metrics}
                assert metrics["lang"] == lang
                assert metrics["cookie"] == "", {"cookies": metrics["cookie"]}
                assert not metrics["imageErrors"], metrics
                assert all(
                    urlparse(r["name"]).netloc == urlparse(a.base).netloc
                    for r in metrics["resources"]
                ), metrics
                d.execute_script(axe)
                results = d.execute_async_script(
                    'const done=arguments[arguments.length-1];axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}}).then(r=>done({violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),passes:r.passes.length,incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})).catch(e=>done({error:String(e)}));'
                )
                results["manual_glyph_contrast"] = glyph_contrast(results)
                report["checks"].append(
                    {"lang": lang, "route": route, "metrics": metrics, "axe": results}
                )
                assert not results.get("error"), results
                assert not results["violations"], {
                    "url": url,
                    "width": width,
                    "axe": results,
                }
                if width == 360 and not route:
                    capture(f"{lang}-mobile-hero.png")
                if lang == "de" and not route and width == 360:
                    d.execute_script(
                        'document.querySelector("caption").scrollIntoView({block:"start",behavior:"instant"})'
                    )
                    w.until(
                        lambda d: d.execute_script(
                            'const top=document.querySelector("caption").getBoundingClientRect().top;return scrollY>500 && top>=0 && top<=120'
                        )
                    )
                    capture("de-mobile-comparison.png")
                if lang == "de" and route == "datenschutz/" and width == 360:
                    capture("de-mobile-website-privacy.png")
                    d.find_element("css selector", "a.language").click()
                    w.until(
                        lambda d: (
                            d.execute_script("return document.documentElement.lang")
                            == "en"
                        )
                    )
                    assert d.execute_script("return location.href").endswith(
                        "/en/privacy/"
                    )
                    capture("en-mobile-website-privacy-after-switch.png")
    # Direct desktop page: full-page capture without the mobile fixture.
    d.switch_to.default_content()
    d.get(a.base + "de/")
    w.until(lambda d: d.find_elements("tag name", "h1"))
    d.set_window_size(1300, 1100)
    d.execute_script('document.querySelectorAll("img").forEach(e=>e.loading="eager")')
    w.until(
        lambda d: d.execute_script(
            "return [...document.images].every(e=>e.complete && e.naturalWidth>0)"
        )
    )
    d.get_full_page_screenshot_as_file(str(out / "de-desktop-full.png"))
    report["captures"].append("de-desktop-full.png")
    # Exercise keyboard skip and navigation through actual controls.
    d.find_element("tag name", "body").send_keys(Keys.CONTROL, Keys.HOME)
    d.find_element("tag name", "body").send_keys(Keys.TAB)
    assert d.execute_script("return document.activeElement.className") == "skip-link"
    d.switch_to.default_content()
    d.get(a.base)
    w.until(lambda d: d.execute_script("return document.documentElement.lang") == "de")
    storage = d.execute_script(
        "return {local:localStorage.length,session:sessionStorage.length,cookies:document.cookie}"
    )
    assert storage == {"local": 0, "session": 0, "cookies": ""}, storage
    d.find_element("css selector", "a.language").click()
    w.until(lambda d: d.execute_script("return document.documentElement.lang") == "en")
    assert d.current_url.endswith("/en/")
    d.find_element("css selector", "figcaption a").click()
    w.until(
        lambda d: d.execute_script(
            'return Boolean(document.querySelector("img")?.naturalWidth)'
        )
    )
    assert d.current_url.endswith("/assets/app-home.webp")
    assert d.execute_script('return document.querySelector("img").naturalWidth') == 450
    report["storage"] = storage
    report["interactions"] = {
        "root_german": True,
        "landing_switch_to_english": True,
        "legal_switch_preserves_page": True,
        "keyboard_skip_link": True,
        "full_size_product_image": True,
    }
    report["ok"] = True
finally:
    (out / "browser-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    d.quit()
print(
    json.dumps(
        {
            "ok": report.get("ok", False),
            "checks": len(report["checks"]),
            "captures": report["captures"],
            "report": str(out / "browser-report.json"),
        },
        ensure_ascii=False,
    )
)
