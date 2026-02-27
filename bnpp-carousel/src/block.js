wp.blocks.registerBlockType('bnpp/carousel-homepage', {
	title: 'BNPP Carousel Homepage',
	icon: 'images-alt2',
	category: 'media',
	edit: function() {
		return wp.element.createElement('div', null, 'BNPP Carousel Block Editor');
	},
	save: function() {
		return null;
	}
});
