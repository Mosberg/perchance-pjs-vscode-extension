# text-to-speech-plugin

A perchance plugin that speaks text out loud using the browser's built-in
Web Speech API (window.speechSynthesis).

## Usage
    speak = {import:text-to-speech-plugin}     // add to the top of your main.pjs
    [speak("This is the perchance text to speech plugin")]
    [speak(yourListName)]
    [speak(sentence, voice, pitch, speed, delay)]
    <button onclick="speak(animal)">click me</button>

Forms supported:
    speak(text)
    speak(text, {voice, pitch, speed, delay, onSpoken})
    speak({text, textStream, voice, pitch, speed, delay, onSpoken})

Returns a Promise (awaitable) with a .stop() method attached; it resolves to
{spokenText} — the text spoken so far.

## Behaviour notes (from main.pjs)
- If plain text contains >= 4 sentences it is internally split into a
  ReadableStream of sentences so .stop() can report exactly what was spoken.
- If a textStream is passed, sentences are buffered and spoken sequentially;
  abbreviations (Mr|Mrs|Dr|Ms|St|Jr|Sr|Prof.) are not treated as sentence ends.
- Voices are lazily loaded into window.perchanceTtsPluginVoices (getVoices() is
  async-populated in some browsers, hence the 100ms poll).
- voice matches either a BCP-47 lang code ("ru-RU") or a voiceURI ("Google UK
  English Female"); voiceURI sets differ per browser.
- delay is in seconds (implemented via setTimeout).
- .stop() cancels speechSynthesis, stops the current sentence promise, and
  resolves the outer promise.

## Files
- main.pjs   — plugin logic ($output)
- index.html — demo/docs page, voice list, styles
