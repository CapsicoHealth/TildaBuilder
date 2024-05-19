const Class = joint.dia.Element.define('uml.Class', {
    attrs: {
        rect: { 'width': 200 },

        '.uml-class-name-rect': { 'stroke': 'black', 'stroke-width': 2, 'fill': '#3498db' },
        '.uml-class-attrs-rect': { 'stroke': 'black', 'stroke-width': 2, 'fill': '#2980b9' },
        '.uml-class-attributespk-rect': { 'stroke': 'black', 'stroke-width': 2, 'fill': '#2980b9' },
        '.uml-class-attributesfk-rect': { 'stroke': 'black', 'stroke-width': 2, 'fill': '#2980b9' },

        '.uml-class-name-text': {
            'ref': '.uml-class-name-rect',
            'ref-y': .5,
            'ref-x': .5,
            'text-anchor': 'middle',
            'y-alignment': 'middle',
            'font-weight': 'bold',
            'fill': 'black',
            'font-size': 12,
            'font-family': 'Times New Roman'
        },
        '.uml-class-attrs-text': {
            'ref': '.uml-class-attrs-rect', 'ref-y': 5, 'ref-x': 5,
            'fill': 'black', 'font-size': 12, 'font-family': 'Times New Roman'
        },
        '.uml-class-attributespk-text': {
            'ref': '.uml-class-attributespk-rect', 'ref-y': 5, 'ref-x': 5,
            'fill': 'black', 'font-size': 12, 'font-family': 'Times New Roman'
        },
        '.uml-class-attributesfk-text': {
            'ref': '.uml-class-attributesfk-rect', 'ref-y': 5, 'ref-x': 5,
            'fill': 'black', 'font-size': 12, 'font-family': 'Times New Roman'
        }
    },

    name: [],
    attributes: [],
    attributespk: [],
    attributesfk: []
}, {
    useCSSSelectors: true,
    markup: [
        '<g class="rotatable">',
        '<g class="scalable">',
        '<rect class="uml-class-name-rect"/><rect class="uml-class-attrs-rect"/><rect class="uml-class-attributespk-rect"/><rect class="uml-class-attributesfk-rect"/>',
        '</g>',
        '<text class="uml-class-name-text"/><text class="uml-class-attrs-text"/><text class="uml-class-attributespk-text"/><text class="uml-class-attributesfk-text"/>',
        '</g>'
    ].join(''),

    initialize: function() {


        this.on('change:name change:attributes change:attributespk change:attributesfk', function() {
            this.updateRectangles();
            this.trigger('uml-update');
        }, this);
        
    
        joint.dia.Element.prototype.initialize.apply(this, arguments);

        this.updateRectangles(); // Initial update to set rectangles correctly
    },

    getClassName: function() {
        return this.get('name');
    },

    updateRectangles: function() {
        var attrs = this.get('attrs');
        var offsetY = 0;
        var minHeight = 20;
        var lineHeight = 13;
        var padding = 10;
    
        var sections = [
            { type: 'name', text: this.getClassName(), visible: this.attr('.uml-class-name-rect/display') !== 'none' },
            { type: 'attrs', text: this.get('attributes'), visible: this.attr('.uml-class-attrs-rect/display') !== 'none' },
            { type: 'attributespk', text: this.get('attributespk'), visible: this.attr('.uml-class-attributespk-rect/display') !== 'none' },
            { type: 'attributesfk', text: this.get('attributesfk'), visible: this.attr('.uml-class-attributesfk-rect/display') !== 'none' }
        ];
    
        var totalHeight = 0;
        var maxWidth = 0;
    
        sections.forEach((section) => {
            if (section.visible) {
                
                var lines = Array.isArray(section.text) ? section.text : [section.text];
//                console.log(lines);
                var rectHeight = Math.max(lines.length * lineHeight + minHeight, minHeight);
//                console.log(rectHeight);
                var sectionWidth = lines.reduce((max, line) => {
                    const estimatedWidth = line.length * 7 + padding * 2;
                    return Math.max(max, estimatedWidth);
                }, 0);
    
                maxWidth = Math.max(maxWidth, sectionWidth);
    
                attrs['.uml-class-' + section.type + '-rect'].height = rectHeight;
                attrs['.uml-class-' + section.type + '-rect'].transform = 'translate(0,' + offsetY + ')';
                attrs['.uml-class-' + section.type + '-text'].text = lines.join('\n');
    
                offsetY += rectHeight; 
                totalHeight += rectHeight;
//                console.log(totalHeight);
            } else {
                attrs['.uml-class-' + section.type + '-rect'].height = 0;
            }
        });
    
        this.resize(maxWidth, totalHeight); 
    }
    
});







/*

const ClassView = joint.dia.ElementView.extend({

    initialize: function() {

        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.listenTo(this.model, 'uml-update', function() {
            this.update();
            this.resize();
        });
    }
});

const Abstract = Class.define('uml.Abstract', {
    attrs: {
        '.uml-class-name-rect': { fill: '#e74c3c' },
        '.uml-class-attrs-rect': { fill: '#c0392b' },
        '.uml-class-methods-rect': { fill: '#c0392b' }
    }
}, {

    getClassName: function() {
        return ['<<Abstract>>', this.get('name')];
    }

});
const AbstractView = ClassView;

const Interface = Class.define('uml.Interface', {
    attrs: {
        '.uml-class-name-rect': { fill: '#f1c40f' },
        '.uml-class-attrs-rect': { fill: '#f39c12' },
        '.uml-class-methods-rect': { fill: '#f39c12' }
    }
}, {
    getClassName: function() {
        return ['<<Interface>>', this.get('name')];
    }
});
const InterfaceView = ClassView;

const Generalization = joint.dia.Link.define('uml.Generalization', {
    attrs: { '.marker-target': { d: 'M 20 0 L 0 10 L 20 20 z', fill: 'white' }}
});

const Implementation = joint.dia.Link.define('uml.Implementation', {
    attrs: {
        '.marker-target': { d: 'M 20 0 L 0 10 L 20 20 z', fill: 'white' },
        '.connection': { 'stroke-dasharray': '3,3' }
    }
});

const Aggregation = joint.dia.Link.define('uml.Aggregation', {
    attrs: { '.marker-target': { d: 'M 40 10 L 20 20 L 0 10 L 20 0 z', fill: 'white' }}
});

const Composition = joint.dia.Link.define('uml.Composition', {
    attrs: { '.marker-target': { d: 'M 40 10 L 20 20 L 0 10 L 20 0 z', fill: 'black' }}
});

const Association = joint.dia.Link.define('uml.Association');

*/