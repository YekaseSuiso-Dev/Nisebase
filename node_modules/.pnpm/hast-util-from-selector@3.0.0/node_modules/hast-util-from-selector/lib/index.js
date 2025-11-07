/**
 * @typedef {import('css-selector-parser').AstAttribute} AstAttribute
 * @typedef {import('css-selector-parser').AstRule} AstRule
 *
 * @typedef {import('hast').Element} HastElement
 * @typedef {import('hast').Properties} HastProperties
 */

/**
 * @typedef Options
 *   Configuration.
 * @property {Space} [space]
 *   Which space first element in the selector is in (default: `'html'`).
 *
 *   When an `svg` element is created in HTML, the space is automatically
 *   switched to SVG.
 *
 * @typedef {'html' | 'svg'} Space
 *   Name of namespace.
 *
 * @typedef State
 *   Info on current context.
 * @property {Space} space
 *   Current space.
 */

import {createParser} from 'css-selector-parser'
import {ok as assert} from 'devlop'
import {h, s} from 'hastscript'

const cssSelectorParse = createParser({syntax: 'selectors-4'})

/** @type {Options} */
const emptyOptions = {}

/**
 * Create one or more `Element`s from a CSS selector.
 *
 * @param {string | null | undefined} [selector='']
 *   CSS selector (default: `''`).
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {HastElement}
 *   Built tree.
 */
export function fromSelector(selector, options) {
  const settings = options || emptyOptions

  const query = cssSelectorParse(selector || '*')

  if (query.rules.length > 1) {
    throw new Error('Cannot handle selector list')
  }

  const head = query.rules[0]
  assert(head, 'expected rule')

  if (
    head.nestedRule &&
    (head.nestedRule.combinator === '+' || head.nestedRule.combinator === '~')
  ) {
    throw new Error(
      'Cannot handle sibling combinator `' +
        head.nestedRule.combinator +
        '` at root'
    )
  }

  const result = rule(head, {space: settings.space || 'html'})

  return result[0]
}

/**
 * Turn a rule into one or more elements.
 *
 * @param {AstRule} query
 *   Selector.
 * @param {State} state
 *   Info on current context.
 * @returns {Array<HastElement>}
 *   One or more elements.
 */
function rule(query, state) {
  const space =
    state.space === 'html' &&
    query.tag &&
    query.tag.type === 'TagName' &&
    query.tag.name === 'svg'
      ? 'svg'
      : state.space

  const pseudoClass = query.pseudoClasses ? query.pseudoClasses[0] : undefined

  if (pseudoClass) {
    if (pseudoClass.name) {
      throw new Error('Cannot handle pseudo class `' + pseudoClass.name + '`')
      /* c8 ignore next 4 -- types say this can occur, but I don’t understand how */
    }

    throw new Error('Cannot handle empty pseudo class')
  }

  if (query.pseudoElement) {
    throw new Error(
      'Cannot handle pseudo element `' + query.pseudoElement + '`'
    )
  }

  const name = query.tag && query.tag.type === 'TagName' ? query.tag.name : ''

  const node = build(space)(name, {
    id: query.ids ? query.ids[query.ids.length - 1] : undefined,
    className: query.classNames,
    ...attributesToHast(query.attributes)
  })
  const results = [node]

  if (query.nestedRule) {
    // Sibling.
    if (
      query.nestedRule.combinator === '+' ||
      query.nestedRule.combinator === '~'
    ) {
      results.push(...rule(query.nestedRule, state))
    }
    // Descendant.
    else {
      node.children.push(...rule(query.nestedRule, {space}))
    }
  }

  return results
}

/**
 * Turn attribute selectors into properties.
 *
 * @param {Array<AstAttribute> | undefined} attributes
 *   Attribute selectors.
 * @returns {HastProperties}
 *   Properties.
 */
function attributesToHast(attributes) {
  /** @type {HastProperties} */
  const props = {}
  let index = -1

  if (attributes) {
    while (++index < attributes.length) {
      const attr = attributes[index]

      if ('operator' in attr) {
        if (attr.operator === '=') {
          const value = attr.value

          // eslint-disable-next-line max-depth
          if (value) {
            assert(value.type === 'String', 'substitution are not enabled')
            props[attr.name] = value.value
          }
        } else {
          throw new Error(
            'Cannot handle attribute equality modifier `' + attr.operator + '`'
          )
        }
      } else {
        props[attr.name] = true
      }
    }
  }

  return props
}

/**
 * @param {Space} space
 *   Space.
 * @returns {typeof h}
 *   `h`.
 */
function build(space) {
  return space === 'html' ? h : s
}
