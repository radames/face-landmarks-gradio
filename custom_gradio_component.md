# Custom Gradio Component

A custom component is a bundled set of HTML, CSS, and JavaScript and scoped as a single web-component. This allows you to create a custom component that can be used in any Gradio app and has its own UI, logic and styling.

Here I'm using Svelte since it's a great framework for building component-based UIs. But you can use any framework you want or even vanilla JavaScript.

## Step 1: Build your HTML, CSS, and JavaScript and bundle as a web-component

[`main.ts`](src/main.ts) is the entry point for your component to mount your app as a web-component.

```js
import styles from './app.css?inline'
import App from './App.svelte'

class FaceCanvas extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(styles));
    root.appendChild(style);
    const app = new App({
      target: root,
    });

  }
}

customElements.define("face-canvas", FaceCanvas);
```

For Dev mode [`index.html`](index.html) is used to mount the component. Note that the component is mounted as a web-component `<face-canvas></face-canvas>` as named above in `customElements.define("face-canvas", FaceCanvas);`

```html
<body>
  <face-canvas id="canvas-root"></face-canvas>
  <script type="module" src="/src/main.ts"></script>
</body>
```

## Step 2: Build your component

On dev mode, run:

```bash
npm run dev
```

To build

```bash
npm run build
```

Your component will be built in the `dist` folder. The single `index.js` can now be used as a custom component in the Gradio

## Step 3: Load your component in Gradio

We're using Gradio [`_js`](https://gradio.app/custom-CSS-and-JS/#custom-js) feature to run a custom JavaScript function that will load the `index.js` file.

This is done using script source `script.src = "file=index.js"` notation. But you can also use a CDN or any other way to serve the `index.js` file as long as it's served as `content-type: application/javascript`.

```python
load_js = """
async () => {
  const script = document.createElement('script');
  script.type = "module"
  script.src = "file=index.js"
  document.head.appendChild(script);
}
"""
blocks = gr.Blocks()
with blocks:
  blocks.load(None, None, None, _js=load_js)

blocks.launch(d)
```

or via CDN

```python
load_js = """
async () => {
  const script = document.createElement('script');
  script.type = "module"
  script.src = "YOUR_CDN_URL/index.js"
  document.head.appendChild(script);
}
"""
blocks = gr.Blocks()
with blocks:
  blocks.load(None, None, None, _js=load_js)

blocks.launch(d)
```

### Step 4: Use your component in Gradio

If everything went well your web-component is correctly registered and can be mounted in Gradio using `gr.HTML` block.

```python

canvas_html = "<face-canvas id='canvas-root' style='display:flex;max-width: 500px;margin: 0 auto;'></face-canvas>"

load_js = """
async () => {
  const script = document.createElement('script');
  script.type = "module"
  script.src = "file=index.js"
  document.head.appendChild(script);
}
"""

blocks = gr.Blocks()
with blocks:
    canvas = gr.HTML(canvas_html,elem_id="canvas_html")
  blocks.load(None, None, None, _js=load_js)

blocks.launch(debug=True, inline=True)

```

## Step 5: Getting data from Gradio to your component

If you read more how [`_js`](https://gradio.app/custom-CSS-and-JS/#custom-js) works, Gradio first run `_js` function with expected arguments as your Python function. We're using a invisble `gr.JSON` block to pass data from Gradio to the front-end `canvas_data = gr.JSON(value={}, visible=False)`. The web-component will store the data in its `_data` property. To get the data back, your js code has to selected the element containing the data and return it.

```python

canvas_html = "<face-canvas id='canvas-root' style='display:flex;max-width: 500px;margin: 0 auto;'></face-canvas>"

load_js = """
async () => {
  const script = document.createElement('script');
  script.type = "module"
  script.src = "file=index.js"
  document.head.appendChild(script);
}
"""
# canvasData is the gr.JSON serialized to the front end
get_js_image = """
async (canvasData) => {
  // select root element and get _data
  const canvasEl = document.getElementById("canvas-root");
  const data = canvasEl? canvasEl._data : null;
  return data
}
"""

def predict(canvas_data):
    # canvas_data is the JSON data returned from the frontend
    base64_img = canvas_data['image']
    image_data = base64.b64decode(base64_img.split(',')[1])
    image = Image.open(BytesIO(image_data))
    return image

blocks = gr.Blocks()
with blocks:
    canvas_data = gr.JSON(value={}, visible=False)
    canvas = gr.HTML(canvas_html,elem_id="canvas_html")
    image_out = gr.Image(type="pil", label="Output")
    btn = gr.Button("Run")
    btn.click(fn=predict, inputs=[canvas_data], outputs=[image_out], _js=get_js_image)
    blocks.load(None, None, None, _js=load_js)

blocks.launch()
```
