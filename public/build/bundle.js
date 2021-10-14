
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // use kebab-case for input props
    const css = (node, props) => {
    	const setProps = props => {
    		for (const [prop, val] of Object.entries(props))
    			node.style.setProperty(prop, val);
    	};
    	setProps(props);

    	return {
    		update(newProps) {
    			setProps(newProps);
    		},
    	};
    };

    const clickOutside = (node, cb) => {

    	const handleOutsideClick = ({ target }) => {
    		if (!node.contains(target)) cb();
    	};
    	window.addEventListener('click', handleOutsideClick);
    	return {
    		destroy() {
    			window.removeEventListener('click', handleOutsideClick);
    		}
    	};

    };

    const clickOutsideSpecifiedElements = (node, args = { nodelist: [], cb: () => null }) => {

    	const handleOutsideClick = ({ target }) => {
    		let isOutside = true;
    		args.nodelist.forEach(e => {
    			if (e.contains(target)) isOutside = false;
    		});
    		if (isOutside) args.cb();
    	};
    	window.addEventListener('click', handleOutsideClick);
    	return {
    		destroy() {
    			window.removeEventListener('click', handleOutsideClick);
    		}
    	};

    };

    const range = function* (start, end, step = 1) {
    	[start, end, step] = (isnt(end)) ? [0, +start, +step] : [+start, +end, +step];
    	const count = (start < end)
    		? () => (start += step) < end
    		: () => (start -= step) > end;
    	do { yield start; } while (count() !== false);
    };

    // iterators
    const times = (times, f = i => i, ...rest) => {
    	const a = [];
    	for (let i of range(Math.abs(times))) a.push(f(i, ...rest));
    	return a;
    };

    const nextFrame = async f => {
    	return new Promise(resolve => requestAnimationFrame(async () => {
    		if (isFunc(f)) await f();
    		resolve();
    	}));
    };

    // basic type checking
    const istype = t => v => typeof v === t;
    const isFunc = istype('function');
    const isnt = v => v === undefined;

    const log = (...msg) => !console.log(...msg) && msg.length === 1 ? msg[0] : msg;

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const introVisible = writable(false);

    function backIn(t) {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    }
    function backOut(t) {
        const s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/CMYKify.svelte generated by Svelte v3.43.0 */
    const file$5 = "src/CMYKify.svelte";

    // (15:0) {#if $introVisible}
    function create_if_block$1(ctx) {
    	let div;
    	let h1;
    	let span0;
    	let span1;
    	let span2;
    	let span3;
    	let t4;
    	let t5;
    	let p0;
    	let t7;
    	let p1;
    	let t8;
    	let span8;
    	let span4;
    	let span5;
    	let span6;
    	let span7;
    	let t13;
    	let t14;
    	let t15;
    	let small;
    	let t16;
    	let a;
    	let t18;
    	let clickOutside_action;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			span0 = element("span");
    			span0.textContent = "C";
    			span1 = element("span");
    			span1.textContent = "M";
    			span2 = element("span");
    			span2.textContent = "Y";
    			span3 = element("span");
    			span3.textContent = "K";
    			t4 = text("ify®");
    			t5 = space();
    			p0 = element("p");
    			p0.textContent = "CMYK for the modern web. Finally!";
    			t7 = space();
    			p1 = element("p");
    			t8 = text("Simply use the provided ");
    			span8 = element("span");
    			span4 = element("span");
    			span4.textContent = "C";
    			span5 = element("span");
    			span5.textContent = "M";
    			span6 = element("span");
    			span6.textContent = "Y";
    			span7 = element("span");
    			span7.textContent = "K";
    			t13 = text("ificators®");
    			t14 = text(" to adjust the colour to your specific needs, and copy/paste the resulting mixin into your scss. It's that easy!");
    			t15 = space();
    			small = element("small");
    			t16 = text("Brought to you by ");
    			a = element("a");
    			a.textContent = "LHLI Corporation™®© Limited";
    			t18 = text(". No rights reserved.");
    			attr_dev(span0, "class", "c svelte-1ylaalw");
    			add_location(span0, file$5, 21, 6, 590);
    			attr_dev(span1, "class", "m svelte-1ylaalw");
    			add_location(span1, file$5, 21, 30, 614);
    			attr_dev(span2, "class", "y svelte-1ylaalw");
    			add_location(span2, file$5, 21, 54, 638);
    			attr_dev(span3, "class", "k svelte-1ylaalw");
    			add_location(span3, file$5, 21, 78, 662);
    			attr_dev(h1, "class", "svelte-1ylaalw");
    			add_location(h1, file$5, 21, 2, 586);
    			add_location(p0, file$5, 22, 2, 698);
    			attr_dev(span4, "class", "c svelte-1ylaalw");
    			add_location(span4, file$5, 25, 5, 804);
    			attr_dev(span5, "class", "m svelte-1ylaalw");
    			add_location(span5, file$5, 25, 29, 828);
    			attr_dev(span6, "class", "y svelte-1ylaalw");
    			add_location(span6, file$5, 25, 53, 852);
    			attr_dev(span7, "class", "k svelte-1ylaalw");
    			add_location(span7, file$5, 25, 77, 876);
    			attr_dev(span8, "class", "cmykificator svelte-1ylaalw");
    			add_location(span8, file$5, 24, 27, 772);
    			add_location(p1, file$5, 23, 2, 741);
    			attr_dev(a, "href", "https://lhli.net");
    			attr_dev(a, "class", "svelte-1ylaalw");
    			add_location(a, file$5, 28, 27, 1068);
    			attr_dev(small, "class", "svelte-1ylaalw");
    			add_location(small, file$5, 28, 2, 1043);
    			attr_dev(div, "class", "cmykify svelte-1ylaalw");
    			add_location(div, file$5, 15, 1, 362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, span0);
    			append_dev(h1, span1);
    			append_dev(h1, span2);
    			append_dev(h1, span3);
    			append_dev(h1, t4);
    			append_dev(div, t5);
    			append_dev(div, p0);
    			append_dev(div, t7);
    			append_dev(div, p1);
    			append_dev(p1, t8);
    			append_dev(p1, span8);
    			append_dev(span8, span4);
    			append_dev(span8, span5);
    			append_dev(span8, span6);
    			append_dev(span8, span7);
    			append_dev(span8, t13);
    			append_dev(p1, t14);
    			append_dev(div, t15);
    			append_dev(div, small);
    			append_dev(small, t16);
    			append_dev(small, a);
    			append_dev(small, t18);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(clickOutside_action = clickOutside.call(null, div, /*clickOutside_function*/ ctx[1]));
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (clickOutside_action && is_function(clickOutside_action.update) && dirty & /*$introVisible*/ 1) clickOutside_action.update.call(null, /*clickOutside_function*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);

    				div_intro = create_in_transition(div, fly, {
    					delay: 10,
    					duration: 1000,
    					y: -500,
    					opacity: 0,
    					easing: backOut
    				});

    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();

    			div_outro = create_out_transition(div, fly, {
    				duration: 300,
    				y: 300,
    				opacity: 0,
    				easing: backIn
    			});

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(15:0) {#if $introVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$introVisible*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$introVisible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$introVisible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $introVisible;
    	validate_store(introVisible, 'introVisible');
    	component_subscribe($$self, introVisible, $$value => $$invalidate(0, $introVisible = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CMYKify', slots, []);

    	onMount(async () => {
    		await nextFrame();
    		set_store_value(introVisible, $introVisible = true, $introVisible);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CMYKify> was created with unknown prop '${key}'`);
    	});

    	const clickOutside_function = () => set_store_value(introVisible, $introVisible = false, $introVisible);

    	$$self.$capture_state = () => ({
    		clickOutside,
    		onMount,
    		nextFrame,
    		introVisible,
    		fly,
    		backOut,
    		backIn,
    		$introVisible
    	});

    	return [$introVisible, clickOutside_function];
    }

    class CMYKify extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CMYKify",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Mixin.svelte generated by Svelte v3.43.0 */

    const file$4 = "src/Mixin.svelte";

    function create_fragment$4(ctx) {
    	let pre;
    	let t;

    	const block = {
    		c: function create() {
    			pre = element("pre");
    			t = text(/*mixin*/ ctx[0]);
    			attr_dev(pre, "class", "svelte-19qvq55");
    			add_location(pre, file$4, 14, 0, 621);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pre, anchor);
    			append_dev(pre, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mixin*/ 1) set_data_dev(t, /*mixin*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let mixin;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Mixin', slots, []);
    	let { settings } = $$props;
    	const writable_props = ['settings'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Mixin> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('settings' in $$props) $$invalidate(1, settings = $$props.settings);
    	};

    	$$self.$capture_state = () => ({ settings, mixin });

    	$$self.$inject_state = $$props => {
    		if ('settings' in $$props) $$invalidate(1, settings = $$props.settings);
    		if ('mixin' in $$props) $$invalidate(0, mixin = $$props.mixin);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*settings*/ 2) {
    			$$invalidate(0, mixin = `@mixin cmykify($c: 20, $m: 40, $y: 100, $k: 10, $raster: 3, $saturation: 1) {
	$base: "https://cmykify.vercel.app";
	background-image: url(#{$base}/cmyk/c#{$c}.png), url(#{$base}/cmyk/m#{$m}.png), url(#{$base}/cmyk/y#{$y}.png), url(#{$base}/cmyk/k#{$k}.png),
		url(#{$base}/cmyk/grain.png);
	background-size: #{$raster * 45}px, #{$raster * 45}px, #{$raster * 45}px, #{$raster * 45}px, 512px;
	filter: saturate($saturation);
}

.cmykified { @include cmykify(${settings.c}, ${settings.m} ,${settings.y}, ${settings.k}, ${settings.raster}, ${settings.saturation}) }`);
    		}
    	};

    	return [mixin, settings];
    }

    class Mixin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { settings: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mixin",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*settings*/ ctx[1] === undefined && !('settings' in props)) {
    			console.warn("<Mixin> was created without expected prop 'settings'");
    		}
    	}

    	get settings() {
    		throw new Error("<Mixin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<Mixin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/parts/Slider.svelte generated by Svelte v3.43.0 */

    const file$3 = "src/parts/Slider.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let legend;
    	let t0;
    	let t1;
    	let input0;
    	let input0_class_value;
    	let t2;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			legend = element("legend");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			add_location(legend, file$3, 12, 1, 227);
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "class", input0_class_value = "slider " + /*title*/ ctx[1] + " svelte-1pqvlso");
    			attr_dev(input0, "min", /*min*/ ctx[2]);
    			attr_dev(input0, "max", /*max*/ ctx[3]);
    			attr_dev(input0, "step", /*step*/ ctx[4]);
    			add_location(input0, file$3, 13, 1, 253);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "slider");
    			attr_dev(input1, "min", /*min*/ ctx[2]);
    			attr_dev(input1, "max", /*max*/ ctx[3]);
    			attr_dev(input1, "step", /*step*/ ctx[4]);
    			add_location(input1, file$3, 14, 1, 330);
    			attr_dev(div, "class", "svelte-1pqvlso");
    			add_location(div, file$3, 11, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, legend);
    			append_dev(legend, t0);
    			append_dev(div, t1);
    			append_dev(div, input0);
    			set_input_value(input0, /*value*/ ctx[0]);
    			append_dev(div, t2);
    			append_dev(div, input1);
    			set_input_value(input1, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[5]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (dirty & /*title*/ 2 && input0_class_value !== (input0_class_value = "slider " + /*title*/ ctx[1] + " svelte-1pqvlso")) {
    				attr_dev(input0, "class", input0_class_value);
    			}

    			if (dirty & /*min*/ 4) {
    				attr_dev(input0, "min", /*min*/ ctx[2]);
    			}

    			if (dirty & /*max*/ 8) {
    				attr_dev(input0, "max", /*max*/ ctx[3]);
    			}

    			if (dirty & /*step*/ 16) {
    				attr_dev(input0, "step", /*step*/ ctx[4]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input0, /*value*/ ctx[0]);
    			}

    			if (dirty & /*min*/ 4) {
    				attr_dev(input1, "min", /*min*/ ctx[2]);
    			}

    			if (dirty & /*max*/ 8) {
    				attr_dev(input1, "max", /*max*/ ctx[3]);
    			}

    			if (dirty & /*step*/ 16) {
    				attr_dev(input1, "step", /*step*/ ctx[4]);
    			}

    			if (dirty & /*value*/ 1 && to_number(input1.value) !== /*value*/ ctx[0]) {
    				set_input_value(input1, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, []);
    	let { title = 'Title' } = $$props;
    	let { value = 0 } = $$props;
    	let { min = 0 } = $$props;
    	let { max = 1 } = $$props;
    	let { step = 1 } = $$props;
    	const writable_props = ['title', 'value', 'min', 'max', 'step'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function input0_change_input_handler() {
    		value = to_number(this.value);
    		(($$invalidate(0, value), $$invalidate(2, min)), $$invalidate(3, max));
    	}

    	function input1_input_handler() {
    		value = to_number(this.value);
    		(($$invalidate(0, value), $$invalidate(2, min)), $$invalidate(3, max));
    	}

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('min' in $$props) $$invalidate(2, min = $$props.min);
    		if ('max' in $$props) $$invalidate(3, max = $$props.max);
    		if ('step' in $$props) $$invalidate(4, step = $$props.step);
    	};

    	$$self.$capture_state = () => ({ title, value, min, max, step });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('min' in $$props) $$invalidate(2, min = $$props.min);
    		if ('max' in $$props) $$invalidate(3, max = $$props.max);
    		if ('step' in $$props) $$invalidate(4, step = $$props.step);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*min, value, max*/ 13) {
    			// sanitize
    			$$invalidate(0, value = Math.max(min, Math.min(value, max))); /*- (value % step)*/
    		}
    	};

    	return [
    		value,
    		title,
    		min,
    		max,
    		step,
    		input0_change_input_handler,
    		input1_input_handler
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			title: 1,
    			value: 0,
    			min: 2,
    			max: 3,
    			step: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get title() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CMYKificator.svelte generated by Svelte v3.43.0 */
    const file$2 = "src/CMYKificator.svelte";

    // (46:2) {#if active}
    function create_if_block(ctx) {
    	let div0;
    	let form;
    	let slider0;
    	let updating_value;
    	let t0;
    	let slider1;
    	let updating_value_1;
    	let t1;
    	let slider2;
    	let updating_value_2;
    	let t2;
    	let slider3;
    	let updating_value_3;
    	let t3;
    	let slider4;
    	let updating_value_4;
    	let t4;
    	let slider5;
    	let updating_value_5;
    	let div0_transition;
    	let t5;
    	let div1;
    	let mixin;
    	let div1_transition;
    	let current;

    	function slider0_value_binding(value) {
    		/*slider0_value_binding*/ ctx[10](value);
    	}

    	let slider0_props = {
    		title: "C",
    		min: "0",
    		max: "100",
    		step: "10"
    	};

    	if (/*settings*/ ctx[0].c !== void 0) {
    		slider0_props.value = /*settings*/ ctx[0].c;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding));

    	function slider1_value_binding(value) {
    		/*slider1_value_binding*/ ctx[11](value);
    	}

    	let slider1_props = {
    		title: "M",
    		min: "0",
    		max: "100",
    		step: "10"
    	};

    	if (/*settings*/ ctx[0].m !== void 0) {
    		slider1_props.value = /*settings*/ ctx[0].m;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding));

    	function slider2_value_binding(value) {
    		/*slider2_value_binding*/ ctx[12](value);
    	}

    	let slider2_props = {
    		title: "Y",
    		min: "0",
    		max: "100",
    		step: "10"
    	};

    	if (/*settings*/ ctx[0].y !== void 0) {
    		slider2_props.value = /*settings*/ ctx[0].y;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding));

    	function slider3_value_binding(value) {
    		/*slider3_value_binding*/ ctx[13](value);
    	}

    	let slider3_props = {
    		title: "K",
    		min: "0",
    		max: "100",
    		step: "10"
    	};

    	if (/*settings*/ ctx[0].k !== void 0) {
    		slider3_props.value = /*settings*/ ctx[0].k;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding));

    	function slider4_value_binding(value) {
    		/*slider4_value_binding*/ ctx[14](value);
    	}

    	let slider4_props = {
    		title: "Dot size",
    		min: "1",
    		max: "10",
    		step: ".1"
    	};

    	if (/*settings*/ ctx[0].raster !== void 0) {
    		slider4_props.value = /*settings*/ ctx[0].raster;
    	}

    	slider4 = new Slider({ props: slider4_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider4, 'value', slider4_value_binding));

    	function slider5_value_binding(value) {
    		/*slider5_value_binding*/ ctx[15](value);
    	}

    	let slider5_props = {
    		title: "Saturation",
    		min: "0",
    		max: "2",
    		step: ".01"
    	};

    	if (/*settings*/ ctx[0].saturation !== void 0) {
    		slider5_props.value = /*settings*/ ctx[0].saturation;
    	}

    	slider5 = new Slider({ props: slider5_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider5, 'value', slider5_value_binding));

    	mixin = new Mixin({
    			props: { settings: /*settings*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			form = element("form");
    			create_component(slider0.$$.fragment);
    			t0 = space();
    			create_component(slider1.$$.fragment);
    			t1 = space();
    			create_component(slider2.$$.fragment);
    			t2 = space();
    			create_component(slider3.$$.fragment);
    			t3 = space();
    			create_component(slider4.$$.fragment);
    			t4 = space();
    			create_component(slider5.$$.fragment);
    			t5 = space();
    			div1 = element("div");
    			create_component(mixin.$$.fragment);
    			attr_dev(form, "class", "svelte-mvzqji");
    			add_location(form, file$2, 47, 4, 1429);
    			attr_dev(div0, "class", "settings svelte-mvzqji");
    			add_location(div0, file$2, 46, 3, 1362);
    			attr_dev(div1, "class", "cmykOut svelte-mvzqji");
    			attr_dev(div1, "contenteditable", "true");
    			attr_dev(div1, "spellcheck", "false");
    			add_location(div1, file$2, 56, 3, 1957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, form);
    			mount_component(slider0, form, null);
    			append_dev(form, t0);
    			mount_component(slider1, form, null);
    			append_dev(form, t1);
    			mount_component(slider2, form, null);
    			append_dev(form, t2);
    			mount_component(slider3, form, null);
    			append_dev(form, t3);
    			mount_component(slider4, form, null);
    			append_dev(form, t4);
    			mount_component(slider5, form, null);
    			/*div0_binding*/ ctx[16](div0);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(mixin, div1, null);
    			/*div1_binding_1*/ ctx[17](div1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};

    			if (!updating_value && dirty & /*settings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*settings*/ ctx[0].c;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty & /*settings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*settings*/ ctx[0].m;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty & /*settings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*settings*/ ctx[0].y;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};

    			if (!updating_value_3 && dirty & /*settings*/ 1) {
    				updating_value_3 = true;
    				slider3_changes.value = /*settings*/ ctx[0].k;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			slider3.$set(slider3_changes);
    			const slider4_changes = {};

    			if (!updating_value_4 && dirty & /*settings*/ 1) {
    				updating_value_4 = true;
    				slider4_changes.value = /*settings*/ ctx[0].raster;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			slider4.$set(slider4_changes);
    			const slider5_changes = {};

    			if (!updating_value_5 && dirty & /*settings*/ 1) {
    				updating_value_5 = true;
    				slider5_changes.value = /*settings*/ ctx[0].saturation;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			slider5.$set(slider5_changes);
    			const mixin_changes = {};
    			if (dirty & /*settings*/ 1) mixin_changes.settings = /*settings*/ ctx[0];
    			mixin.$set(mixin_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			transition_in(slider3.$$.fragment, local);
    			transition_in(slider4.$$.fragment, local);
    			transition_in(slider5.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			transition_in(mixin.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, { delay: 100 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			transition_out(slider3.$$.fragment, local);
    			transition_out(slider4.$$.fragment, local);
    			transition_out(slider5.$$.fragment, local);
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			transition_out(mixin.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, { delay: 100 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(slider0);
    			destroy_component(slider1);
    			destroy_component(slider2);
    			destroy_component(slider3);
    			destroy_component(slider4);
    			destroy_component(slider5);
    			/*div0_binding*/ ctx[16](null);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div1);
    			destroy_component(mixin);
    			/*div1_binding_1*/ ctx[17](null);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(46:2) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let div0;
    	let css_action;
    	let t0;
    	let div2;
    	let div1;
    	let span0;
    	let span1;
    	let span2;
    	let t4;
    	let t5;
    	let br;
    	let t6;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*active*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "C";
    			span1 = element("span");
    			span1.textContent = "M";
    			span2 = element("span");
    			span2.textContent = "Y";
    			t4 = text("Kificator®");
    			t5 = space();
    			br = element("br");
    			t6 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "cmyk svelte-mvzqji");
    			add_location(div0, file$2, 39, 1, 1063);
    			attr_dev(span0, "class", "c svelte-mvzqji");
    			add_location(span0, file$2, 42, 3, 1243);
    			attr_dev(span1, "class", "m svelte-mvzqji");
    			add_location(span1, file$2, 42, 27, 1267);
    			attr_dev(span2, "class", "y svelte-mvzqji");
    			add_location(span2, file$2, 42, 51, 1291);
    			attr_dev(div1, "class", "header svelte-mvzqji");
    			add_location(div1, file$2, 41, 2, 1124);
    			add_location(br, file$2, 44, 2, 1337);
    			attr_dev(div2, "class", "cmykIt svelte-mvzqji");
    			add_location(div2, file$2, 40, 1, 1101);
    			attr_dev(div3, "class", "cmykificator svelte-mvzqji");
    			add_location(div3, file$2, 38, 0, 1035);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(div1, span1);
    			append_dev(div1, span2);
    			append_dev(div1, t4);
    			/*div1_binding*/ ctx[7](div1);
    			append_dev(div2, t5);
    			append_dev(div2, br);
    			append_dev(div2, t6);
    			if (if_block) if_block.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(css_action = css.call(null, div0, /*props*/ ctx[5])),
    					listen_dev(div1, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(div1, "mouseenter", /*mouseenter_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (css_action && is_function(css_action.update) && dirty & /*props*/ 32) css_action.update.call(null, /*props*/ ctx[5]);

    			if (/*active*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*div1_binding*/ ctx[7](null);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $introVisible;
    	validate_store(introVisible, 'introVisible');
    	component_subscribe($$self, introVisible, $$value => $$invalidate(18, $introVisible = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CMYKificator', slots, []);

    	let { settings = {
    		c: 20,
    		m: 40,
    		y: 100,
    		k: 10,
    		raster: 3,
    		saturation: 1
    	} } = $$props;

    	let props, active = false, settingsEl, cmykoutEl, headerEl, outsideListener;
    	const writable_props = ['settings'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CMYKificator> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			headerEl = $$value;
    			$$invalidate(4, headerEl);
    		});
    	}

    	const click_handler = () => $$invalidate(1, active = !active);
    	const mouseenter_handler = () => $$invalidate(1, active = true);

    	function slider0_value_binding(value) {
    		if ($$self.$$.not_equal(settings.c, value)) {
    			settings.c = value;
    			$$invalidate(0, settings);
    		}
    	}

    	function slider1_value_binding(value) {
    		if ($$self.$$.not_equal(settings.m, value)) {
    			settings.m = value;
    			$$invalidate(0, settings);
    		}
    	}

    	function slider2_value_binding(value) {
    		if ($$self.$$.not_equal(settings.y, value)) {
    			settings.y = value;
    			$$invalidate(0, settings);
    		}
    	}

    	function slider3_value_binding(value) {
    		if ($$self.$$.not_equal(settings.k, value)) {
    			settings.k = value;
    			$$invalidate(0, settings);
    		}
    	}

    	function slider4_value_binding(value) {
    		if ($$self.$$.not_equal(settings.raster, value)) {
    			settings.raster = value;
    			$$invalidate(0, settings);
    		}
    	}

    	function slider5_value_binding(value) {
    		if ($$self.$$.not_equal(settings.saturation, value)) {
    			settings.saturation = value;
    			$$invalidate(0, settings);
    		}
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			settingsEl = $$value;
    			$$invalidate(2, settingsEl);
    		});
    	}

    	function div1_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			cmykoutEl = $$value;
    			$$invalidate(3, cmykoutEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    	};

    	$$self.$capture_state = () => ({
    		Mixin,
    		Slider,
    		css,
    		clickOutsideSpecifiedElements,
    		slide,
    		introVisible,
    		settings,
    		props,
    		active,
    		settingsEl,
    		cmykoutEl,
    		headerEl,
    		outsideListener,
    		$introVisible
    	});

    	$$self.$inject_state = $$props => {
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    		if ('props' in $$props) $$invalidate(5, props = $$props.props);
    		if ('active' in $$props) $$invalidate(1, active = $$props.active);
    		if ('settingsEl' in $$props) $$invalidate(2, settingsEl = $$props.settingsEl);
    		if ('cmykoutEl' in $$props) $$invalidate(3, cmykoutEl = $$props.cmykoutEl);
    		if ('headerEl' in $$props) $$invalidate(4, headerEl = $$props.headerEl);
    		if ('outsideListener' in $$props) $$invalidate(6, outsideListener = $$props.outsideListener);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*settingsEl, cmykoutEl, outsideListener, headerEl*/ 92) {
    			if (settingsEl && cmykoutEl) {
    				outsideListener?.destroy();

    				$$invalidate(6, outsideListener = clickOutsideSpecifiedElements(null, {
    					nodelist: [settingsEl, cmykoutEl, headerEl],
    					cb: () => $$invalidate(1, active = false)
    				}));
    			}
    		}

    		if ($$self.$$.dirty & /*active*/ 2) {
    			if (active) set_store_value(introVisible, $introVisible = false, $introVisible);
    		}

    		if ($$self.$$.dirty & /*settings*/ 1) {
    			$$invalidate(5, props = {
    				'background-image': `
			url(/cmyk/c${settings.c}.png),
			url(/cmyk/m${settings.m}.png),
			url(/cmyk/y${settings.y}.png),
			url(/cmyk/k${settings.k}.png)`,
    				'background-size': `${settings.raster * 45}px, ${settings.raster * 45}px, ${settings.raster * 45}px, ${settings.raster * 45}px`,
    				filter: `saturate(${settings.saturation})`
    			});
    		}
    	};

    	return [
    		settings,
    		active,
    		settingsEl,
    		cmykoutEl,
    		headerEl,
    		props,
    		outsideListener,
    		div1_binding,
    		click_handler,
    		mouseenter_handler,
    		slider0_value_binding,
    		slider1_value_binding,
    		slider2_value_binding,
    		slider3_value_binding,
    		slider4_value_binding,
    		slider5_value_binding,
    		div0_binding,
    		div1_binding_1
    	];
    }

    class CMYKificator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { settings: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CMYKificator",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get settings() {
    		throw new Error("<CMYKificator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<CMYKificator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/parts/Info.svelte generated by Svelte v3.43.0 */
    const file$1 = "src/parts/Info.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let svg;
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "d", "M11.985.066c-6.573 0-11.921 5.348-11.921 11.92 0 6.574 5.348 11.922 11.921 11.922 6.573 0 11.921-5.348 11.921-11.922 0-6.573-5.347-11.92-11.921-11.92Zm0 22.842c-6.022 0-10.921-4.899-10.921-10.922 0-6.021 4.899-10.92 10.921-10.92 6.021 0 10.921 4.899 10.921 10.92 0 6.023-4.899 10.922-10.921 10.922Z");
    			add_location(path0, file$1, 7, 3, 189);
    			attr_dev(path1, "d", "M11.988 8.977c1.642 0 2.978-1.335 2.978-2.977 0-1.642-1.336-2.978-2.978-2.978 -1.642 0-2.977 1.336-2.977 2.978 0 1.642 1.336 2.977 2.977 2.977Zm0-4.955c1.091 0 1.978.887 1.978 1.978 0 1.091-.887 1.977-1.978 1.977 -1.09 0-1.978-.887-1.978-1.977 0-1.09.888-1.978 1.978-1.978Z");
    			add_location(path1, file$1, 10, 3, 511);
    			attr_dev(path2, "d", "M15.502 17.045v0h-.436v-6.275c0-.441-.357-.8-.797-.8h-4.84c-.411 0-.772.18-1.017.506 -.198.264-.307.609-.307.972 0 .848.556 1.463 1.323 1.463h.7v4.132h-.7c-.754 0-1.324.638-1.324 1.484 0 .844.557 1.457 1.324 1.457h6.072c.472 0 .878-.233 1.113-.642 .283-.491.28-1.155-.007-1.652 -.236-.41-.639-.645-1.104-.645Zm.246 1.799c-.058.099-.131.141-.247.141h-6.072c-.308 0-.324-.381-.324-.457 0-.005.004-.484.324-.484h1.2c.276 0 .5-.224.5-.5v-5.132c0-.276-.224-.5-.5-.5h-1.2c-.308 0-.323-.385-.323-.463 0-.02.003-.479.323-.479h4.638v6.575c0 .276.224.5.5.5h.935c.001 0 .001 0 .001 0 .076 0 .165.018.239.147 .106.183.108.475.006.652Z");
    			add_location(path2, file$1, 13, 3, 808);
    			attr_dev(g, "class", "svelte-nmvhn");
    			add_location(g, file$1, 6, 2, 182);
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-nmvhn");
    			add_location(svg, file$1, 5, 1, 154);
    			attr_dev(div, "class", "icon info svelte-nmvhn");
    			add_location(div, file$1, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", stop_propagation(/*click_handler*/ ctx[1]), false, false, true);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $introVisible;
    	validate_store(introVisible, 'introVisible');
    	component_subscribe($$self, introVisible, $$value => $$invalidate(0, $introVisible = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Info', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(introVisible, $introVisible = !$introVisible, $introVisible);
    	$$self.$capture_state = () => ({ introVisible, $introVisible });
    	return [$introVisible, click_handler];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let cmykificator0;
    	let updating_settings;
    	let t0;
    	let cmykificator1;
    	let updating_settings_1;
    	let t1;
    	let cmykify;
    	let t2;
    	let info;
    	let t3;
    	let link0;
    	let link1;
    	let link2;
    	let current;

    	function cmykificator0_settings_binding(value) {
    		/*cmykificator0_settings_binding*/ ctx[2](value);
    	}

    	let cmykificator0_props = {};

    	if (/*settingsA*/ ctx[0] !== void 0) {
    		cmykificator0_props.settings = /*settingsA*/ ctx[0];
    	}

    	cmykificator0 = new CMYKificator({
    			props: cmykificator0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(cmykificator0, 'settings', cmykificator0_settings_binding));

    	function cmykificator1_settings_binding(value) {
    		/*cmykificator1_settings_binding*/ ctx[3](value);
    	}

    	let cmykificator1_props = {};

    	if (/*settingsB*/ ctx[1] !== void 0) {
    		cmykificator1_props.settings = /*settingsB*/ ctx[1];
    	}

    	cmykificator1 = new CMYKificator({
    			props: cmykificator1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(cmykificator1, 'settings', cmykificator1_settings_binding));
    	cmykify = new CMYKify({ $$inline: true });
    	info = new Info({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cmykificator0.$$.fragment);
    			t0 = space();
    			create_component(cmykificator1.$$.fragment);
    			t1 = space();
    			create_component(cmykify.$$.fragment);
    			t2 = space();
    			create_component(info.$$.fragment);
    			t3 = space();
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.googleapis.com");
    			add_location(link0, file, 38, 1, 969);
    			attr_dev(link1, "rel", "preconnect");
    			attr_dev(link1, "href", "https://fonts.gstatic.com");
    			attr_dev(link1, "crossorigin", "");
    			add_location(link1, file, 39, 1, 1032);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=JetBrains+Mono:wght@300&family=DM+Serif+Display&family=DM+Serif+Text&display=swap");
    			attr_dev(link2, "type", "text/css");
    			attr_dev(link2, "rel", "stylesheet");
    			add_location(link2, file, 40, 1, 1104);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(cmykificator0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(cmykificator1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(cmykify, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(info, target, anchor);
    			insert_dev(target, t3, anchor);
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const cmykificator0_changes = {};

    			if (!updating_settings && dirty & /*settingsA*/ 1) {
    				updating_settings = true;
    				cmykificator0_changes.settings = /*settingsA*/ ctx[0];
    				add_flush_callback(() => updating_settings = false);
    			}

    			cmykificator0.$set(cmykificator0_changes);
    			const cmykificator1_changes = {};

    			if (!updating_settings_1 && dirty & /*settingsB*/ 2) {
    				updating_settings_1 = true;
    				cmykificator1_changes.settings = /*settingsB*/ ctx[1];
    				add_flush_callback(() => updating_settings_1 = false);
    			}

    			cmykificator1.$set(cmykificator1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cmykificator0.$$.fragment, local);
    			transition_in(cmykificator1.$$.fragment, local);
    			transition_in(cmykify.$$.fragment, local);
    			transition_in(info.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cmykificator0.$$.fragment, local);
    			transition_out(cmykificator1.$$.fragment, local);
    			transition_out(cmykify.$$.fragment, local);
    			transition_out(info.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cmykificator0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(cmykificator1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(cmykify, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(info, detaching);
    			if (detaching) detach_dev(t3);
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let settingsA = {
    			c: 20,
    			m: 40,
    			y: 100,
    			k: 10,
    			raster: 3,
    			saturation: 1
    		},
    		settingsB = {
    			c: 20,
    			m: 40,
    			y: 100,
    			k: 10,
    			raster: 3,
    			saturation: 1
    		};

    	if (localStorage.getItem('CMYKprops')) [settingsA, settingsB] = JSON.parse(localStorage.getItem('CMYKprops'));

    	const preloadImages = (a = []) => {
    		['c', 'm', 'y', 'k'].forEach(channel => {
    			a.push(times(11, value => {
    				const i = new Image();
    				i.src = `/cmyk/${channel}${value * 10}.png`;
    				return i;
    			}));
    		});

    		return a;
    	};

    	const preloaded = preloadImages();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function cmykificator0_settings_binding(value) {
    		settingsA = value;
    		$$invalidate(0, settingsA);
    	}

    	function cmykificator1_settings_binding(value) {
    		settingsB = value;
    		$$invalidate(1, settingsB);
    	}

    	$$self.$capture_state = () => ({
    		CMYKify,
    		CMYKificator,
    		Info,
    		log,
    		times,
    		settingsA,
    		settingsB,
    		preloadImages,
    		preloaded
    	});

    	$$self.$inject_state = $$props => {
    		if ('settingsA' in $$props) $$invalidate(0, settingsA = $$props.settingsA);
    		if ('settingsB' in $$props) $$invalidate(1, settingsB = $$props.settingsB);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*settingsA, settingsB*/ 3) {
    			localStorage.setItem('CMYKprops', JSON.stringify([settingsA, settingsB]));
    		}
    	};

    	return [
    		settingsA,
    		settingsB,
    		cmykificator0_settings_binding,
    		cmykificator1_settings_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({ target: document.body });

    return app;

})();
//# sourceMappingURL=bundle.js.map
