# hast-util-from-selector

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[hast][] utility to create nodes from a complex CSS selectors.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`fromSelector(selector?[, options])`](#fromselectorselector-options)
    *   [`Options`](#options)
    *   [`Space`](#space)
*   [Support](#support)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a utility that can generate elements from complex CSS selectors.

## When should I use this?

You can use this when you’re generating a bunch of elements, and manually
creating objects each time is starting to feel like a waste.
This package is much more powerful than
[`hast-util-parse-selector`][hast-util-parse-selector],
and similar to [`hastscript`][hastscript].

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install hast-util-from-selector
```

In Deno with [`esm.sh`][esmsh]:

```js
import {fromSelector} from 'https://esm.sh/hast-util-from-selector@3'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {fromSelector} from 'https://esm.sh/hast-util-from-selector@3?bundle'
</script>
```

## Use

```js
import {fromSelector} from 'hast-util-from-selector'

console.log(fromSelector('p svg[viewbox="0 0 10 10"] circle[cx=10][cy=10][r=10]'))
```

Yields:

```js
{
  type: 'element',
  tagName: 'p',
  properties: {},
  children: [
    {
      type: 'element',
      tagName: 'svg',
      properties: {viewBox: '0 0 10 10'},
      children: [
        {
          type: 'element',
          tagName: 'circle',
          properties: {cx: '10', cy: '10', r: '10'},
          children: []
        }
      ]
    }
  ]
}
```

## API

This package exports the identifier [`fromSelector`][api-from-selector].
There is no default export.

### `fromSelector(selector?[, options])`

Create one or more [`Element`][element]s from a CSS selector.

###### Parameters

*   `selector` (`string`, default: `''`)
    — CSS selector
*   `options` ([`Options`][api-options], optional)
    — configuration

###### Returns

[`Element`][element].

### `Options`

Configuration (TypeScript type).

###### Fields

*   `space` ([`Space`][api-space], default: `'html'`)
    — which space first element in the selector is in.
    When an `svg` element is created in HTML, the space is automatically
    switched to SVG

### `Space`

Name of namespace (TypeScript type).

###### Type

```ts
type Space = 'html' | 'svg'
```

## Support

*   [x] `*` (universal selector, *creates a `div` in HTML, `g` in SVG*)
*   [x] `p` (type selector)
*   [x] `.class` (class selector)
*   [x] `#id` (id selector)
*   [x] `[attr]` (attribute existence, *creates a boolean*)
*   [x] `[attr=value]` (attribute equality)
*   [x] `article p` (descendant combinator)
*   [x] `article > p` (child combinator)
*   [x] `section h1 + p` (next-sibling combinator, *not at root*)
*   [x] `section h1 ~ p` (subsequent-sibling combinator, *not at root*)

## Types

This package is fully typed with [TypeScript][].
It exports the additional types [`Options`][api-options] and
[`Space`][api-space].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line,
`hast-util-from-selector@^3`, compatible with Node.js 16.

## Security

Use of `hast-util-from-selector` can open you up to a
[cross-site scripting (XSS)][xss] attack as values are injected into the syntax
tree.

Either do not use user input in `from-selector` or use
[`hast-util-santize`][hast-util-sanitize].

## Related

*   [`hast-util-parse-selector`](https://github.com/syntax-tree/hast-util-parse-selector)
    — create an element from a simple CSS selector

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/hast-util-from-selector/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/hast-util-from-selector/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/hast-util-from-selector.svg

[coverage]: https://codecov.io/github/syntax-tree/hast-util-from-selector

[downloads-badge]: https://img.shields.io/npm/dm/hast-util-from-selector.svg

[downloads]: https://www.npmjs.com/package/hast-util-from-selector

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=hast-util-from-selector

[size]: https://bundlejs.com/?q=hast-util-from-selector

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[hast]: https://github.com/syntax-tree/hast

[element]: https://github.com/syntax-tree/hast#element

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[hast-util-sanitize]: https://github.com/syntax-tree/hast-util-sanitize

[hast-util-parse-selector]: https://github.com/syntax-tree/hast-util-parse-selector

[hastscript]: https://github.com/syntax-tree/hastscript

[api-from-selector]: #fromselectorselector-options

[api-options]: #options

[api-space]: #space
