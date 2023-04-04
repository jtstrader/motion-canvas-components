# Motion Canvas Components

## Using this library

1. Clone this repo.
1. Run `npm install <path to this repo>` in your motion canvas project
1. Set your `vite.config.ts` to look like this:

```ts
export default defineConfig({
  plugins: [motionCanvas()],
  resolve: {
    alias: {
      '@motion-canvas/core': path.resolve('./node_modules/@motion-canvas/core'),
      '@motion-canvas/2d': path.resolve('./node_modules/@motion-canvas/2d'),
    },
  },
});
```

### From npm

1. Run `npm install <library name here>`
1. Set your `vite.config.ts` to look like this:

```ts
export default defineConfig({
  plugins: [motionCanvas()],
  resolve: {
    alias: {
      '@motion-canvas/core': path.resolve('./node_modules/@motion-canvas/core'),
      '@motion-canvas/2d': path.resolve('./node_modules/@motion-canvas/2d'),
    },
  },
});
```

## Components
|Name|Description|
|----|-----------|
|Gear|A spur gear with configurable size, teeth, struts, and a *single* concentric center|
