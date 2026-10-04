# goto-plugin — complete project package

Generator: https://perchance.org/goto-plugin
Live subdomain origin: https://f5bf8db8adc0699f9600a46ca53227e7.perchance.org/goto-plugin

The goto-plugin is a SELF-CONTAINED Perchance plugin. Its dependency manifest
(`imports`) is EMPTY - it imports nothing, uses no third-party libraries, no
build pipeline, no bundler, and no binary assets. Everything it ships is the
two files below.

--------------------------------------------------------------------------------
## 1. INTERNAL CODE  (internal-code/)

| file         | role |
|--------------|------|
| main.pjs     | The plugin implementation. Defines `$output(place, anchor, containerEl)` (the function users call as `goto(...)`) plus the helper `addDefaultPluginCSS()`. `$output` makes the imported value the function itself. |
| index.html   | The plugin's documentation / demo page shown at perchance.org/goto-plugin. |

## 2. EXTERNAL CODE  (external-code/)

The plugin itself has NO imports (dependency manifest: `imports: []`).
Listed here are the external Perchance generators that the plugin's
documentation LINKS TO, included for completeness.

| generator       | why it is referenced |
|-----------------|----------------------|
| go-to-plugin    | Community-made plugin with a similar/extra feature set. |
| remember-plugin | Companion plugin for save/restore, recommended for saving game state. |

## 3. PROJECT RESOURCES  (examples/)

Runnable example generators referenced from the documentation:

| generator                          | demonstrates |
|------------------------------------|--------------|
| goto-plugin-example                | more complex multi-room example |
| goto-plugin-example-with-audio     | grid-style world layout + audio |
| goto-and-remember-plugins-example  | goto + remember together (save/load) |

## 4. BUILD / CONFIG  (build-config/)

None. Perchance plugins are interpreted directly at runtime; there is no
build step, bundler, transpiler, config file, or dependency lockfile.

## 5. DEPENDENCY MANIFEST  (build-config/dependency-manifest.json)

Raw output of the public Perchance API
`https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=goto-plugin`
confirming `"imports": []`.

--------------------------------------------------------------------------------
## Usage

main.pjs:
    goto = {import:goto-plugin}

then in a list:
    darkroom = You're in a dark room. [goto(lightroom, "turn on the light")]

Optional 3rd arg: an element id whose contents will be replaced instead of the
button's parent element:
    [goto(myCoolList, "button text", myCoolContainer)]

## Licensing

These files are the source of the Perchance generator "goto-plugin".
User-submitted generator source on Perchance is publicly viewable by design.
Included third-party generators (go-to-plugin, remember-plugin, examples)
remain the property of their respective authors and are bundled here only as
reference copies of code referenced by the goto-plugin documentation.
