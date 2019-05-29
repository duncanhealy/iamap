// Copyright Rod Vagg; Licensed under the Apache License, Version 2.0, see README.md for more information

const { test } = require('tap')
const { murmurHasher, identityHasher, memoryStore } = require('./common')
const IAMap = require('../')

IAMap.registerHasher('murmur3-32', 32, murmurHasher)
IAMap.registerHasher('identity', 32, identityHasher) // not recommended

let Constructor

test('empty object', async (t) => {
  const store = memoryStore()
  const map = await IAMap.create(store, { codec: 'murmur3-32' })
  const emptySerialized = {
    codec: Buffer.from([ 0x23 ]),
    bitWidth: 5,
    bucketSize: 8,
    dataMap: 0,
    nodeMap: 0,
    elements: []
  }

  t.strictDeepEqual(map.toSerializable(), emptySerialized)

  const loadedMap = await IAMap.load(store, map.id)
  t.strictDeepEqual(loadedMap, map)

  Constructor = map.constructor
})

test('empty custom', async (t) => {
  const store = memoryStore()
  const emptySerialized = {
    codec: Buffer.from([ 0 ]), // identity
    bitWidth: 8,
    bucketSize: 3,
    dataMap: 0,
    nodeMap: 0,
    elements: []
  }
  const id = await store.save(emptySerialized)

  const map = await IAMap.load(store, id)
  t.strictDeepEqual(map.toSerializable(), emptySerialized)
  t.strictEqual(map.config.codec, 'identity')
  t.strictEqual(map.config.bitWidth, 8)
  t.strictEqual(map.config.bucketSize, 3)
  t.strictEqual(map.dataMap, 0)
  t.strictEqual(map.nodeMap, 0)
  t.ok(Array.isArray(map.elements))
  t.strictEqual(map.elements.length, 0)
})

test('child custom', async (t) => {
  const store = memoryStore()
  const emptySerialized = {
    dataMap: 0b110011,
    nodeMap: 0b101010,
    elements: []
  }
  const id = await store.save(emptySerialized)

  const map = await IAMap.load(store, id, 10, {
    codec: Buffer.from([ 0 ]),
    bitWidth: 7,
    bucketSize: 30
  })

  t.strictDeepEqual(map.toSerializable(), emptySerialized)
  t.strictEqual(map.depth, 10)
  t.strictEqual(map.config.codec, 'identity')
  t.strictEqual(map.config.bitWidth, 7)
  t.strictEqual(map.config.bucketSize, 30)
  t.strictEqual(map.dataMap, 0b110011)
  t.strictEqual(map.nodeMap, 0b101010)
  t.ok(Array.isArray(map.elements))
  t.strictEqual(map.elements.length, 0)
})

test('malformed', async (t) => {
  const store = memoryStore()
  let emptySerialized = {
    codec: Buffer.from([ 10 ]), // not registered
    bitWidth: 8,
    bucketSize: 3,
    dataMap: 0,
    nodeMap: 0,
    elements: []
  }
  let id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.codec = Buffer.from([ 0 ]) // identity
  emptySerialized.bitWidth = 'foo'
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.bitWidth = -1
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.bitWidth = 4
  emptySerialized.bucketSize = 'foo'
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.bucketSize = -1
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.bucketSize = 3
  emptySerialized.elements = { nope: 'nope' }
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.elements = []
  emptySerialized.nodeMap = 'foo'
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.nodeMap = 0
  emptySerialized.dataMap = 'foo'
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.dataMap = 0
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id, 'foo'))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.elements = [ { woot: 'nope' } ]
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = Object.assign({}, emptySerialized) // clone
  emptySerialized.elements = [ [ { nope: 'nope' } ] ]
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id))

  emptySerialized = {
    dataMap: 0b110011,
    nodeMap: 0b101010,
    elements: []
  }
  id = await store.save(emptySerialized)
  t.resolves(IAMap.load(store, id, 32, {
    codec: Buffer.from([ 0 ]),
    bitWidth: 7,
    bucketSize: 30
  })) // this is OK for bitWidth of 8 and hash bytes of 32

  emptySerialized = Object.assign({}, emptySerialized) // clone
  id = await store.save(emptySerialized)
  t.rejects(IAMap.load(store, id, 33, { // this is not OK for a bitWidth of 8 and hash bytes of 32
    codec: Buffer.from([ 0 ]),
    bitWidth: 8,
    bucketSize: 30
  }))

  t.throws(() => new Constructor(store, { codec: 'identity' }, 0, 0, 0, [ { nope: 'nope' } ]))
})

test('bad loads', async (t) => {
  const store = memoryStore()

  let emptySerialized = {
    dataMap: 0b110011,
    nodeMap: 0b101010,
    elements: []
  }
  let id = await store.save(emptySerialized)

  t.rejects(IAMap.load(store, id, 32, {
    bitWidth: 8,
    bucketSize: 30
  })) // no codec

  t.rejects(IAMap.load(store, id, 32, {
    codec: { yoiks: true },
    bitWidth: 8,
    bucketSize: 30
  })) // bad codec

  t.rejects(IAMap.load(store, id, 32, {
    codec: Buffer.from([ 0 ]),
    bitWidth: 'foo',
    bucketSize: 30
  })) // bad bitWidth

  t.rejects(IAMap.load(store, id, 32, {
    codec: Buffer.from([ 0 ]),
    bitWidth: 8,
    bucketSize: true
  })) // bad bucketSize

  t.rejects(IAMap.load(store, id, 'foo', {
    codec: Buffer.from([ 0 ]),
    bitWidth: 8,
    bucketSize: 8
  })) // bad bucketSize
})
