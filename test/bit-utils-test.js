// Copyright Rod Vagg; Licensed under the Apache License, Version 2.0, see README.md for more information

const { test } = require('tap')
const { mask, bitmapHas, index, setBit } = require('../bit-utils')

test('mask', (t) => {
  t.strictEqual(mask([0b11111111], 0, 5), 0b11111)
  t.strictEqual(mask([0b10101010], 0, 5), 0b1010)
  t.strictEqual(mask([0b00000001], 0, 5), 0b1)
  t.strictEqual(mask([0b00010000], 0, 5), 0b10000)
  t.strictEqual(mask([0b1001000010000100], 0, 9), 0b010000100)
  t.strictEqual(mask([0b1010101010101010], 0, 9), 0b010101010)
  t.strictEqual(mask([ (3 << 4) | 2 ], 0, 4), 2)
  t.strictEqual(mask([ (3 << 4) | 2 ], 1, 4), 3)
  t.strictEqual(mask([ (3 << 4) | 2, (5 << 4) | 4 ], 2, 4), 4)
  t.strictEqual(mask([ (3 << 4) | 2, (5 << 4) | 4 ], 3, 4), 5)
  t.strictEqual(mask([ (7 << 3) | 6 ], 0, 3), 6)
  t.strictEqual(mask([ (7 << 3) | 6 ], 1, 3), 7)
  t.strictEqual(mask([ 0b11000000, 0b1 ], 2, 3), 7) // span two bytes, 2 bits from first, 1 from second
  t.done()
})

test('bitmapHas', (t) => {
  t.ok(!bitmapHas(0b0, 0))
  t.ok(!bitmapHas(0b0, 1))
  t.ok(bitmapHas(0b1, 0))
  t.ok(!bitmapHas(0b1, 1))
  t.ok(!bitmapHas(0b101010, 2))
  t.ok(bitmapHas(0b101010, 3))
  t.ok(!bitmapHas(0b101010, 4))
  t.ok(bitmapHas(0b101010, 5))
  t.ok(bitmapHas(0b100000, 5))
  t.ok(bitmapHas(0b0100000, 5))
  t.ok(bitmapHas(0b00100000, 5))
  t.done()
})

test('index', (t) => {
  t.strictEqual(index(0b111111, 0), 0)
  t.strictEqual(index(0b111111, 1), 1)
  t.strictEqual(index(0b111111, 2), 2)
  t.strictEqual(index(0b111111, 4), 4)
  t.strictEqual(index(0b111100, 2), 0)
  t.strictEqual(index(0b111101, 4), 3)
  t.strictEqual(index(0b111001, 4), 2)
  t.strictEqual(index(0b111000, 4), 1)
  t.strictEqual(index(0b110000, 4), 0)
  // new node, no bitmask, insertion at the start
  t.strictEqual(index(0b000000, 0), 0)
  t.strictEqual(index(0b000000, 1), 0)
  t.strictEqual(index(0b000000, 2), 0)
  t.strictEqual(index(0b000000, 3), 0)
  t.done()
})

test('setBit', (t) => {
  t.strictEqual(setBit(0b0, 0, 1), 0b00000001)
  t.strictEqual(setBit(0b0, 1, 1), 0b00000010)
  t.strictEqual(setBit(0b0, 7, 1), 0b10000000)
  t.strictEqual(setBit(0b11111111, 0, 1), 0b11111111)
  t.strictEqual(setBit(0b11111111, 7, 1), 0b11111111)
  t.strictEqual(setBit(0b01010101, 1, 1), 0b01010111)
  t.strictEqual(setBit(0b01010101, 7, 1), 0b11010101)
  t.strictEqual(setBit(0b11111111, 0, 0), 0b11111110)
  t.strictEqual(setBit(0b11111111, 1, 0), 0b11111101)
  t.strictEqual(setBit(0b11111111, 7, 0), 0b01111111)
  t.strictEqual(setBit(0b0, 0, 0), 0b00000000)
  t.strictEqual(setBit(0b0, 7, 0), 0b00000000)
  t.strictEqual(setBit(0b01010101, 0, 0), 0b01010100)
  t.strictEqual(setBit(0b01010101, 6, 0), 0b00010101)
  t.strictEqual(setBit(0b1100001011010010010010100000001, 0, 0), 0b1100001011010010010010100000000)
  t.strictEqual(setBit(0b1100001011010010010010100000000, 0, 1), 0b1100001011010010010010100000001)
  t.strictEqual(setBit(0b0, 31, 1), -0b10000000000000000000000000000000)
  t.done()
})