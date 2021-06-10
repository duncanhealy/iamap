/**
 * <T>
 */
export type Store<T> = import('./interface').Store<T>;
export type Config = import('./interface').Config;
export type Options = import('./interface').Options;
export type SerializedKV = import('./interface').SerializedKV;
export type SerializedElement = import('./interface').SerializedElement;
export type SerializedNode = import('./interface').SerializedNode;
export type SerializedRoot = import('./interface').SerializedRoot;
/**
 * ```js
 * let map = await iamap.create(store, options)
 * ```
 *
 * Create a new IAMap instance with a backing store. This operation is asynchronous and returns a `Promise` that
 * resolves to a `IAMap` instance.
 *
 * @name iamap.create
 * @function
 * @async
 * @template T
 * @param {Store<T>} store - A backing store for this Map. The store should be able to save and load a serialised
 * form of a single node of a IAMap which is provided as a plain object representation. `store.save(node)` takes
 * a serialisable node and should return a content address / ID for the node. `store.load(id)` serves the inverse
 * purpose, taking a content address / ID as provided by a `save()` operation and returning the serialised form
 * of a node which can be instantiated by IAMap. In addition, two identifier handling methods are needed:
 * `store.isEqual(id1, id2)` is required to check the equality of the two content addresses / IDs
 * (which may be custom for that data type). `store.isLink(obj)` is used to determine if an object is a link type
 * that can be used for `load()` operations on the store. It is important that link types be different to standard
 * JavaScript arrays and don't share properties used by the serialized form of an IAMap (e.g. such that a
 * `typeof obj === 'object' && Array.isArray(obj.data)`) .This is because a node data element may either be a link to
 * a child node, or an inlined child node, so `isLink()` should be able to determine if an object is a link, and if not,
 * `Array.isArray(obj)` will determine if that data element is a bucket of elements, or the above object check be able
 * to determine that an inline child node exists at the data element.
 * The `store` object should take the following form:
 * `{ async save(node):id, async load(id):node, isEqual(id,id):boolean, isLink(obj):boolean }`
 *
 * Options:
 *   - hashAlg (number) - A [multicodec](https://github.com/multiformats/multicodec/blob/master/table.csv)
 *     hash function identifier, e.g. `0x23` for `murmur3-32`. Hash functions must be registered with {@link iamap.registerHasher}.
 *   - bitWidth (number, default 8) - The number of bits to extract from the hash to form a data element index at
 *     each level of the Map, e.g. a bitWidth of 5 will extract 5 bits to be used as the data element index, since 2^5=32,
 *     each node will store up to 32 data elements (child nodes and/or entry buckets). The maximum depth of the Map is
 *     determined by `floor((hashBytes * 8) / bitWidth)` where `hashBytes` is the number of bytes the hash function
 *     produces, e.g. `hashBytes=32` and `bitWidth=5` yields a maximum depth of 51 nodes. The maximum `bitWidth`
 *     currently allowed is `8` which will store 256 data elements in each node.
 *   - bucketSize (number, default  5) - The maximum number of collisions acceptable at each level of the Map. A
 *     collision in the `bitWidth` index at a given depth will result in entries stored in a bucket (array). Once the
 *     bucket exceeds `bucketSize`, a new child node is created for that index and all entries in the bucket are
 *     pushed
 *
 * @param {Options} options - Options for this IAMap
 * @param {Uint8Array} [map] - for internal use
 * @param {number} [depth] - for internal use
 * @param {Element[]} [data] - for internal use
 */
export function create<T>(store: import("./interface").Store<T>, options: Options, map?: Uint8Array | undefined, depth?: number | undefined, data?: Element[] | undefined): Promise<IAMap<T>>;
/**
 * ```js
 * let map = await iamap.load(store, id)
 * ```
 *
 * Create a IAMap instance loaded from a serialised form in a backing store. See {@link iamap.create}.
 *
 * @name iamap.load
 * @function
 * @async
 * @template T
 * @param {Store<T>} store - A backing store for this Map. See {@link iamap.create}.
 * @param {any} id - An content address / ID understood by the backing `store`.
 * @param {number} [depth=0]
 * @param {Options} [options]
 */
export function load<T>(store: import("./interface").Store<T>, id: any, depth?: number | undefined, options?: import("./interface").Options | undefined): Promise<IAMap<T>>;
/**
 * ```js
 * iamap.registerHasher(hashAlg, hashBytes, hasher)
 * ```
 *
 * Register a new hash function. IAMap has no hash functions by default, at least one is required to create a new
 * IAMap.
 *
 * @name iamap.registerHasher
 * @function
 * @param {number} hashAlg - A [multicodec](https://github.com/multiformats/multicodec/blob/master/table.csv) hash
 * function identifier **number**, e.g. `0x23` for `murmur3-32`.
 * @param {number} hashBytes - The number of bytes to use from the result of the `hasher()` function (e.g. `32`)
 * @param {(inp:Uint8Array)=>Uint8Array} hasher - A hash function that takes a `Uint8Array` derived from the `key` values used for this
 * Map and returns a `Uint8Array` (or a `Uint8Array`-like, such that each data element of the array contains a single byte value).
 */
export function registerHasher(hashAlg: number, hashBytes: number, hasher: (inp: Uint8Array) => Uint8Array): void;
/**
 * Perform a per-block synchronous traversal. Takes a root block, the key being looked up and an
 * `isEqual()` for comparing identifiers. Returns a {@link GetTraversal} object for performing
 * traversals block-by-block.
 *
 * @name iamap.traverseGet
 * @function
 * @param {Object} rootBlock The root block, for extracting the IAMap configuration data
 * @param {string|Uint8Array} key a key to get. See {@link IAMap#get} for details about
 * acceptable `key` types.
 * @param {function} isEqual A function that compares two identifiers in the data store. See
 * {@link iamap.create} for details on the backing store and the requirements of an `isEqual()` function.
 * @param {function} isLink A function that can discern if an object is a link type used by the data store. See
 * {@link iamap.create} for details on the backing store and the requirements of an `isLink()` function.
 * @param {number} [depth]
 * @returns A {@link GetTraversal} object for performing the traversal block-by-block.
 */
export function traverseGet(rootBlock: Object, key: string | Uint8Array, isEqual: Function, isLink: Function, depth?: number | undefined): GetTraversal<any>;
/**
 * Perform a per-block synchronous traversal of all nodes in the IAMap identified by the provided `rootBlock`
 * allowing for collection / iteration over keys, values and k/v entry pairs.
 * Returns an {@link EntriesTraversal} object for performing traversals block-by-block.
 *
 * @name iamap.traverseEntries
 * @function
 * @param {Object} rootBlock The root block, for extracting the IAMap configuration data
 * @returns An {@link EntriesTraversal} object for performing the traversal block-by-block and collecting their
 * entries.
 */
export function traverseEntries(rootBlock: Object): EntriesTraversal<any>;
/**
 * Instantiate an IAMap from a valid serialisable form of an IAMap node. The serializable should be the same as
 * produced by {@link IAMap#toSerializable}.
 * Serialised forms of root nodes must satisfy both {@link iamap.isRootSerializable} and {@link iamap.isSerializable}. For
 * root nodes, the `options` parameter will be ignored and the `depth` parameter must be the default value of `0`.
 * Serialised forms of non-root nodes must satisfy {@link iamap.isSerializable} and have a valid `options` parameter and
 * a non-`0` `depth` parameter.
 *
 * @name iamap.fromSerializable
 * @function
 * @template T
 * @param {Store<T>} store A backing store for this Map. See {@link iamap.create}.
 * @param {any} id An optional ID for the instantiated IAMap node. Unlike {@link iamap.create},
 * `fromSerializable()` does not `save()` a newly created IAMap node so an ID is not generated for it. If one is
 * required for downstream purposes it should be provided, if the value is `null` or `undefined`, `node.id` will
 * be `null` but will remain writable.
 * @param {any} serializable The serializable form of an IAMap node to be instantiated
 * @param {Options} [options=null] An options object for IAMap child node instantiation. Will be ignored for root
 * node instantiation (where `depth` = `0`) See {@link iamap.create}.
 * @param {number} [depth=0] The depth of the IAMap node. Where `0` is the root node and any `>0` number is a child
 * node.
 * @returns {IAMap<T>}
 */
export function fromSerializable<T>(store: import("./interface").Store<T>, id: any, serializable: any, options?: import("./interface").Options | undefined, depth?: number | undefined): IAMap<T>;
/**
 * Determine if a serializable object is an IAMap node type, can be used to assert whether a data block is
 * an IAMap node before trying to instantiate it.
 * This should pass for both root nodes as well as child nodes
 *
 * @name iamap.isSerializable
 * @function
 * @param {any} serializable An object that may be a serialisable form of an IAMap node
 * @returns {boolean} An indication that the serialisable form is or is not an IAMap node
 */
export function isSerializable(serializable: any): boolean;
/**
 * Determine if a serializable object is an IAMap root type, can be used to assert whether a data block is
 * an IAMap before trying to instantiate it.
 *
 * @name iamap.isRootSerializable
 * @function
 * @param {any} serializable An object that may be a serialisable form of an IAMap root node
 * @returns {boolean} An indication that the serialisable form is or is not an IAMap root node
 */
export function isRootSerializable(serializable: any): boolean;
/**
 * Immutable Asynchronous Map
 *
 * The `IAMap` constructor should not be used directly. Use `iamap.create()` or `iamap.load()` to instantiate.
 *
 * @class
 * @template T
 * @property {any} id - A unique identifier for this `IAMap` instance. IDs are generated by the backing store and
 * are returned on `save()` operations.
 * @property {number} config.hashAlg - The hash function used by this `IAMap` instance. See {@link iamap.create} for more
 * details.
 * @property {number} config.bitWidth - The number of bits used at each level of this `IAMap`. See {@link iamap.create}
 * for more details.
 * @property {number} config.bucketSize - TThe maximum number of collisions acceptable at each level of the Map.
 * @property {Uint8Array} [map=Uint8Array] - Bitmap indicating which slots are occupied by data entries or child node links,
 * each data entry contains an bucket of entries. Must be the appropriate size for `config.bitWidth`
 * (`2 ** config.bitWith / 8` bytes).
 * @property {number} [depth=0] - Depth of the current node in the IAMap, `depth` is used to extract bits from the
 * key hashes to locate slots
 * @property {Array} [data=[]] - Array of data elements (an internal `Element` type), each of which contains a
 * bucket of entries or an ID of a child node
 * See {@link iamap.create} for more details.
 */
export class IAMap<T> {
    /**
     * @ignore
     * @param {Store<T>} store
     * @param {Options} [options]
     * @param {Uint8Array} [map]
     * @param {number} [depth]
     * @param {Element[]} [data]
     */
    constructor(store: Store<T>, options?: import("./interface").Options | undefined, map?: Uint8Array | undefined, depth?: number | undefined, data?: Element[] | undefined);
    store: import("./interface").Store<T>;
    /** @type {any|null} */
    id: any | null;
    config: import("./interface").Config;
    map: Uint8Array;
    depth: number;
    /** @type {readonly Element[]} */
    data: readonly Element[];
    /**
     * Asynchronously create a new `IAMap` instance identical to this one but with `key` set to `value`.
     *
     * @param {(string|Uint8Array)} key - A key for the `value` being set whereby that same `value` may
     * be retrieved with a `get()` operation with the same `key`. The type of the `key` object should either be a
     * `Uint8Array` or be convertable to a `Uint8Array` via `TextEncoder.
     * @param {any} value - Any value that can be stored in the backing store. A value could be a serialisable object
     * or an address or content address or other kind of link to the actual value.
     * @returns {Promise<IAMap<T>>} A `Promise` containing a new `IAMap` that contains the new key/value pair.
     * @async
     */
    set(key: (string | Uint8Array), value: any): Promise<IAMap<T>>;
    /**
     * Asynchronously find and return a value for the given `key` if it exists within this `IAMap`.
     *
     * @param {string|Uint8Array} key - A key for the value being sought. See {@link IAMap#set} for
     * details about acceptable `key` types.
     * @returns {Promise<any>} A `Promise` that resolves to the value being sought if that value exists within this `IAMap`. If the
     * key is not found in this `IAMap`, the `Promise` will resolve to `undefined`.
     * @async
     */
    get(key: string | Uint8Array): Promise<any>;
    /**
     * Asynchronously find and return a boolean indicating whether the given `key` exists within this `IAMap`
     *
     * @param {string|Uint8Array} key - A key to check for existence within this `IAMap`. See
     * {@link IAMap#set} for details about acceptable `key` types.
     * @returns {Promise<boolean>} A `Promise` that resolves to either `true` or `false` depending on whether the `key` exists
     * within this `IAMap`.
     * @async
     */
    has(key: string | Uint8Array): Promise<boolean>;
    /**
     * Asynchronously create a new `IAMap` instance identical to this one but with `key` and its associated
     * value removed. If the `key` does not exist within this `IAMap`, this instance of `IAMap` is returned.
     *
     * @param {string|Uint8Array} key - A key to remove. See {@link IAMap#set} for details about
     * acceptable `key` types.
     * @returns {Promise<IAMap<T>>} A `Promise` that resolves to a new `IAMap` instance without the given `key` or the same `IAMap`
     * instance if `key` does not exist within it.
     * @async
     */
    delete(key: string | Uint8Array): Promise<IAMap<T>>;
    /**
     * Asynchronously count the number of key/value pairs contained within this `IAMap`, including its children.
     *
     * @returns {Promise<number>} A `Promise` with a `number` indicating the number of key/value pairs within this `IAMap` instance.
     * @async
     */
    size(): Promise<number>;
    /**
     * Asynchronously emit all keys that exist within this `IAMap`, including its children. This will cause a full
     * traversal of all nodes.
     *
     * @returns {AsyncGenerator<Uint8Array>} An async iterator that yields keys. All keys will be in `Uint8Array` format regardless of which
     * format they were inserted via `set()`.
     * @async
     */
    keys(): AsyncGenerator<Uint8Array>;
    /**
     * Asynchronously emit all values that exist within this `IAMap`, including its children. This will cause a full
     * traversal of all nodes.
     *
     * @returns {AsyncGenerator<any>} An async iterator that yields values.
     * @async
     */
    values(): AsyncGenerator<any>;
    /**
     * Asynchronously emit all { key, value } pairs that exist within this `IAMap`, including its children. This will
     * cause a full traversal of all nodes.
     *
     * @returns {AsyncGenerator<{ key: Uint8Array, value: any}>} An async iterator that yields objects with the properties `key` and `value`.
     * @async
     */
    entries(): AsyncGenerator<{
        key: Uint8Array;
        value: any;
    }, any, any>;
    /**
     * Asynchronously emit the IDs of this `IAMap` and all of its children.
     *
     * @returns {AsyncGenerator<any>} An async iterator that yields the ID of this `IAMap` and all of its children. The type of ID is
     * determined by the backing store which is responsible for generating IDs upon `save()` operations.
     */
    ids(): AsyncGenerator<any>;
    /**
     * Returns a serialisable form of this `IAMap` node. The internal representation of this local node is copied into a plain
     * JavaScript `Object` including a representation of its data array that the key/value pairs it contains as well as
     * the identifiers of child nodes.
     * Root nodes (depth==0) contain the full map configuration information, while intermediate and leaf nodes contain only
     * data that cannot be inferred by traversal from a root node that already has this data (hashAlg and bucketSize -- bitWidth
     * is inferred by the length of the `map` byte array).
     * The backing store can use this representation to create a suitable serialised form. When loading from the backing store,
     * `IAMap` expects to receive an object with the same layout from which it can instantiate a full `IAMap` object. Where
     * root nodes contain the full set of data and intermediate and leaf nodes contain just the required data.
     * For content addressable backing stores, it is expected that the same data in this serialisable form will always produce
     * the same identifier.
     * Note that the `map` property is a `Uint8Array` so will need special handling for some serialization forms (e.g. JSON).
     *
     * Root node form:
     * ```
     * {
     *   hashAlg: number
     *   bucketSize: number
     *   map: Uint8Array
     *   data: Array
     * }
     * ```
     *
     * Intermediate and leaf node form:
     * ```
     * {
     *   map: Uint8Array
     *   data: Array
     * }
     * ```
     *
     * Where `data` is an array of a mix of either buckets or links:
     *
     * * A bucket is an array of two elements, the first being a `key` of type `Uint8Array` and the second a `value`
     *   or whatever type has been provided in `set()` operations for this `IAMap`.
     * * A link is an object of the type that the backing store provides upon `save()` operations and can be identified
     *   with `isLink()` calls.
     *
     * Buckets and links are differentiated by their "kind": a bucket is an array while a link is a "link" kind as dictated
     * by the backing store. We use `Array.isArray()` and `store.isLink()` to perform this differentiation.
     *
     * @returns {SerializedNode|SerializedRoot} An object representing the internal state of this local `IAMap` node, including its links to child nodes
     * if any.
     */
    toSerializable(): SerializedNode | SerializedRoot;
    /**
     * Calculate the number of entries locally stored by this node. Performs a scan of local buckets and adds up
     * their size.
     *
     * @returns {number} A number representing the number of local entries.
     */
    directEntryCount(): number;
    /**
     * Calculate the number of child nodes linked by this node. Performs a scan of the local entries and tallies up the
     * ones containing links to child nodes.
     *
     * @returns {number} A number representing the number of direct child nodes
     */
    directNodeCount(): number;
    /**
     * Asynchronously perform a check on this node and its children that it is in canonical format for the current data.
     * As this uses `size()` to calculate the total number of entries in this node and its children, it performs a full
     * scan of nodes and therefore incurs a load and deserialisation cost for each child node.
     * A `false` result from this method suggests a flaw in the implemetation.
     *
     * @async
     * @returns {Promise<boolean>} A Promise with a boolean value indicating whether this IAMap is correctly formatted.
     */
    isInvariant(): Promise<boolean>;
    /**
     * A convenience shortcut to {@link iamap.fromSerializable} that uses this IAMap node instance's backing `store` and
     * configuration `options`. Intended to be used to instantiate child IAMap nodes from a root IAMap node.
     *
     * @param {any} id An optional ID for the instantiated IAMap node. See {@link iamap.fromSerializable}.
     * @param {any} serializable The serializable form of an IAMap node to be instantiated.
     * @param {number} [depth=0] The depth of the IAMap node. See {@link iamap.fromSerializable}.
    */
    fromChildSerializable(id: any, serializable: any, depth?: number | undefined): IAMap<T>;
}
export namespace IAMap {
    /**
     * @template T
     * @param {IAMap<T> | any} node
     * @returns {boolean}
     */
    function isIAMap<T_1>(node: any): boolean;
}
declare class Element {
    /**
     * @param {KV[]} [bucket]
     * @param {any} [link]
     */
    constructor(bucket?: KV[] | undefined, link?: any);
    bucket: KV[] | null;
    link: any;
    /**
     * @returns {SerializedElement}
     */
    toSerializable(): SerializedElement;
}
declare namespace Element {
    /**
     * @param {(link:any)=>boolean} isLink
     * @param {any} obj
     * @returns {Element}
     */
    function fromSerializable(isLink: (link: any) => boolean, obj: any): Element;
}
/**
 * A `GetTraversal` object is returned by the {@link iamap.traverseGet} function for performing
 * block-by-block traversals on an IAMap.
 * @template T
 */
declare class GetTraversal<T> {
    /**
     * @param {IAMap<T>|any} rootBlock
     * @param {string|Uint8Array} key
     * @param {function} isEqual
     * @param {function} isLink
     * @param {number} [depth]
     */
    constructor(rootBlock: IAMap<T> | any, key: string | Uint8Array, isEqual: Function, isLink: Function, depth?: number | undefined);
    _config: any;
    _key: Uint8Array;
    /** @type {number} */
    _depth: number;
    _store: {
        load(): void;
        save(): void;
        isEqual(): boolean;
        isLink(): boolean;
    } & {
        isEqual: Function;
        isLink: Function;
    };
    _hash: Uint8Array;
    _node: any;
    _value: any;
    /**
     * Perform a single-block traversal.
     *
     * @returns {any|null} A link to the next block required for further traversal (to be provided via
     * {@link GetTraversal#next}) or `null` if a value has been found (and is available via
     * {@link GetTraversal#value}) or the value doesn't exist.
     */
    traverse(): any | null;
    /**
     * Provide the next block required for traversal.
     *
     * @param {Object} block A serialized form of an IAMap intermediate/child block identified by an identifier
     * returned from {@link GetTraversal#traverse}.
     */
    next(block: Object): void;
    /**
     * Get the final value of the traversal, if one has been found.
     *
     * @returns A value, if one has been found, otherwise `undefined` (if one has not been found or we are mid-traversal)
     */
    value(): any;
}
/**
 * An `EntriesTraversal` object is returned by the {@link iamap.traverseEntries} function for performing
 * block-by-block traversals on an IAMap for the purpose of iterating over or collecting keys, values and
 * key/value pairs.
 * @template T
 */
declare class EntriesTraversal<T> {
    /**
     * @param {IAMap<T>|any} rootBlock
     * @param {number} [depth]
     */
    constructor(rootBlock: IAMap<T> | any, depth?: number | undefined);
    _config: any;
    /** @type {number} */
    _depth: number;
    /**
     * @type {{ node: IAMap<T>, nextLink: number }[]}
     */
    _stack: {
        node: IAMap<T>;
        nextLink: number;
    }[];
    _peek(): {
        node: IAMap<T>;
        nextLink: number;
    };
    /**
     * @param {IAMap<T>} node
     * @param {number} start
     * @returns number
     */
    _nextLink(node: IAMap<T>, start: number): number;
    /**
     * Perform a single-block traversal.
     *
     * @returns {any} A link to the next block required for further traversal (to be provided via
     * {@link EntriesTraversal#next}) or `null` if there are no more nodes to be traversed in this IAMap.
     */
    traverse(): any;
    /**
     * Provide the next block required for traversal.
     *
     * @param {IAMap<T>|any} block A serialized form of an IAMap intermediate/child block identified by an identifier
     * returned from {@link EntriesTraversal#traverse}.
     */
    next(block: IAMap<T> | any): void;
    _visit(): Generator<KV, void, unknown>;
    /**
     * An iterator providing all of the keys in the current IAMap node being traversed.
     *
     * @returns {Iterable<Uint8Array>} An iterator that yields keys in `Uint8Array` form (regardless of how they were set).
     */
    keys(): Iterable<Uint8Array>;
    /**
     * An iterator providing all of the values in the current IAMap node being traversed.
     *
     * @returns {Iterable<any>} An iterator that yields value objects.
     */
    values(): Iterable<any>;
    /**
     * An iterator providing all of the entries in the current IAMap node being traversed in the form of
     * { key, value } pairs.
     *
     * @returns {Iterable<{ key: Uint8Array, value: any }>} An iterator that yields objects with the properties `key` and `value`.
     */
    entries(): Iterable<{
        key: Uint8Array;
        value: any;
    }>;
}
declare class KV {
    /**
     * @param {Uint8Array} key
     * @param {any} value
     */
    constructor(key: Uint8Array, value: any);
    key: Uint8Array;
    value: any;
    /**
     * @returns {SerializedKV}
     */
    toSerializable(): import("./interface").SerializedKV;
}
declare namespace KV {
    /**
     * @param {SerializedKV} obj
     * @returns {KV}
     */
    function fromSerializable(obj: import("./interface").SerializedKV): KV;
}
export {};
//# sourceMappingURL=iamap.d.ts.map