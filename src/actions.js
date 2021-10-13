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