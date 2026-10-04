CATEGORY: project resources
STATUS: EMPTY - the project authors no resource files of its own.

The generator produces all of its output from code: the plugin returns a plain JavaScript
object of verb conjugations, and the page renders static documentation markup. There are no
authored image, audio, video, font, model, shader, animation, JSON, prefab, or UI-template
files in the project source tree.

The complete authored source is two files, both included in full in ../01-internal-code/:
  - main.pjs   (generator code: the plugin function + inlined compromise library)
  - index.html (documentation page + inline <style> block)
