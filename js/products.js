/* Prices and copy live here so they can be edited without touching the rest of the shop. */
(function (window) {
  'use strict';

  window.CLUTCHPLAY = window.CLUTCHPLAY || {};

  window.CLUTCHPLAY.SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

  window.CLUTCHPLAY.ORDER_EMAIL = 'orders@clutchplay.ph';

  window.CLUTCHPLAY.PRODUCTS = [
    {
      id: 'tee',
      name: 'Oversized Script Logo Tee',
      price: 799,
      tag: 'Drop 01',
      blurb: 'Heavy cotton. Oversized streetwear fit. Script wordmark across the chest.',
      details:
        'Boxy crewneck in heavy cotton. Dropped shoulders, relaxed sleeves, and the ClutchPlay script printed large on the chest. Made to look lived-in from day one.',
      colors: [
        {
          id: 'cream',
          name: 'Cream',
          hex: '#F5F0E6',
          ink: 'Burgundy script',
          images: [
            'images/tee-cream-wall.jpg',
            'images/tee-cream-fence.jpg',
            'images/tees-flatlay.jpg',
          ],
        },
        {
          id: 'black',
          name: 'Black',
          hex: '#111111',
          ink: 'Cream script',
          images: ['images/tees-flatlay.jpg'],
        },
      ],
    },
    {
      id: 'hoodie',
      name: 'CLUTCHPLAY™ Black Hoodie',
      price: 1499,
      tag: 'Essentials',
      blurb: 'Heavy cotton pullover. Kangaroo pocket. Bold italic mark on the chest.',
      details:
        'Black pullover hoodie with drawstrings, ribbed cuffs, and a kangaroo pocket. CLUTCHPLAY™ is printed in bold, slightly italic white type across the chest.',
      colors: [
        {
          id: 'black',
          name: 'Black',
          hex: '#111111',
          ink: 'White italic mark',
          images: ['images/hoodie.jpg'],
        },
      ],
    },
  ];

  window.CLUTCHPLAY.getProduct = function (id) {
    return window.CLUTCHPLAY.PRODUCTS.find(function (item) {
      return item.id === id;
    }) || null;
  };

  window.CLUTCHPLAY.getColor = function (product, colorId) {
    if (!product || !product.colors.length) {
      return null;
    }
    return (
      product.colors.find(function (color) {
        return color.id === colorId;
      }) || product.colors[0]
    );
  };

  window.CLUTCHPLAY.formatPeso = function (amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };
})(window);
