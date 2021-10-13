// use kebab-case for input props
export const css = (node, props) => {
	const setProps = props => {
		for (const [prop, val] of Object.entries(props))
			node.style.setProperty(prop, val)
	};
	setProps(props);

	return {
		update(newProps) {
			setProps(newProps);
		},
	};
}

export const clickOutside = (node, cb) => {

	const handleOutsideClick = ({ target }) => {
		if (!node.contains(target)) cb();
	};
	window.addEventListener('click', handleOutsideClick);
	return {
		destroy() {
			window.removeEventListener('click', handleOutsideClick);
		}
	};

}