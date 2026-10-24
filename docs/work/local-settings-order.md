# Local bottom settings order

Publication remains paused. Owner requested text-size slider directly next to the Wrap column selector. Move existing font-label and fontValue together after Wrap in DOM order, removing the auto left margin. Preserve input IDs, values, handlers, appearance preference and keyboard tab order. This is a reversible visual rearrangement; verify build and actual live DOM/layout plus a functional font-size adjustment. No new tests, dependencies, backend, version or publication changes needed.

Executed: frontend build passed; actual Chromium confirmed slider immediately follows Wrap in DOM and visual position, size adjustment changes editor font and displayed value; settings-bar screenshot visually inspected. Whitespace check passed. Nothing published.
