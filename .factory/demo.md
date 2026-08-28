# Sample demo

Open `https://recipe-source-card.sociobot.in/demo/`, or choose **Try it with
sample data** on the first screen. No extension, account, or setup is needed.

The demo loads a bundled Recipe JSON-LD record for lemon and sage roast
potatoes. It passes that record through the production parser, fills the same
editable recipe fields, and downloads the production Markdown and JSON export
formats. Both files retain `https://recipes.example/lemon-sage-potatoes` as
their source.

Demo changes use only the localStorage key
`demo:recipe-source-card:draft`. The demo never reads the website license key
or extension storage. **Reset demo** restores the bundled recipe. **Start for
real** deletes the demo key before returning home.

Claim checks start with fresh browser contexts and use only this bundled sample.
