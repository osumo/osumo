import d3 from 'd3';

var parallelSets = (function () {
  //setting
  var settings = {
    canvas_width: 800,
    canvas_height: 450,
    gapratio: 0.8,
    delay: 1500,
    padding: 5
  };
  var color = ['#659CEF', '#cd5555', '#FEE093', '#9f79ee', '#ee9572', '#008b00', '#b4cdcd', '#3d3d3d'];
  var elem;
  var div = '#brick';
  var _data;
  var x, y, line;
  var maxn;
  var maxv;
  var groups;

  var returnObject = function (i, flag) {
    for (var m = 0; m < _data[flag].length; m++) {
      if (_data[flag][m].key === i) {
        return _data[flag][m];
      }
    }
  };

  var tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip');

  function setBrickTooltip (d) {
    tooltip.html('Cluster ' + d.key);
    tooltip.style('visibility', 'visible');
  }

  var linkLine = function (start) {
    return function (l) {
      // var source = currentData[0][l.source],
      // target = currentData[1][l.target],
      var source = returnObject(l.source, 0);
      var target = returnObject(l.target, 1);
      var gapWidth = x(0) - 3;
      var bandWidth = x.rangeBand() + gapWidth;
      var startx = x.rangeBand() - bandWidth;
      var sourcey = y(source.offsetValue) + source.order * settings.padding + y(l.outOffset) + y(l.count) / 2;
      var targety = y(target.offsetValue) +
                    target.order * settings.padding +
                    y(l.inOffset) +
                    y(l.count) / 2;
      var points = start ? [
        [startx, sourcey], [startx, sourcey], [startx, sourcey], [startx, sourcey]
      ] : [
        {x: startx, y: sourcey},
        {x: startx + gapWidth / 2, y: sourcey},
        {x: startx + gapWidth / 2, y: targety},
        {x: -3, y: targety}
      ];
      return line(points);
    };
  };

  function render () {
    var G = elem.selectAll('g.group')
                .data(_data)
                .enter().append('svg:g')
                .attr('class', 'group')
                .attr('transform', function (d, i) { return 'translate(' + (x(i) - x(0)) + ',0)'; });

    var nodes = G.selectAll('g.node')
                 .data(function (d) { return d; })
                 .enter().append('g')
                 .attr('class', 'node');

    nodes.append('rect').attr('fill', function (d) {
      if (d.label === 'mRNA') return color[d.key - 1];
      else return color[8 - d.key];
    })
         .attr('y', function (n, i) { return y(n.offsetValue) + i * settings.padding; })
         .attr('width', x.rangeBand())
         .attr('height', function (n) {
           return y(n.height);
         })
         .on('mouseover', function (d) { setBrickTooltip(d); })
         .on('mousemove', function () {
           tooltip.style('top', (d3.event.pageY + 0) + 'px').style('left', (d3.event.pageX + 20) + 'px');
         })
         .on('mouseout', function () {
           tooltip.style('visibility', 'hidden');
         })
         .on('click', function (d) {
           if (groups.group_f === 1) {
             d3.select(this).attr('class', 'box black');
             groups.GROUP1.node.push(d.key);
           }
           if (groups.group_f === 2) {
             d3.select(this).attr('class', 'box red');
             groups.GROUP2.node.push(d.key);
           }
         });

    // var links =
    nodes.selectAll('path.link')
         .data(function (n) {
           if (n.incoming.length > 1) {
             return n.incoming;
           } else {
             return [];
           }
         })
         .enter().append('path')
                 .attr('class', 'link')
                 .style('stroke-width', function (l) {
                   return y(l.count);
                 })
                 .attr('d', linkLine(false))
                 .on('click', function (l) {
                   if (groups.group_f === 1) {
                     d3.select(this).attr('class', 'link two');
                     groups.GROUP1.link.push({source: l.source, target: l.target});
                   }
                   if (groups.group_f === 2) {
                     d3.select(this).attr('class', 'link one');
                     groups.GROUP2.link.push({source: l.source, target: l.target});
                   }
                 });
  }

  return {
    init: function (input_data, group_data) {
      groups = group_data;

      elem = d3.select(div)
               .append('svg:svg')
               .attr('width', settings.canvas_width)
               .attr('height', settings.canvas_height);

      _data = input_data;

      maxn = d3.max(_data, function (t) { return t.length; });
      maxv = d3.max(_data, function (t) { return d3.sum(t, function (n) { return n.height; }); });

      x = d3.scale.ordinal().domain(d3.range(_data.length)).rangeBands([0, settings.canvas_width + (settings.canvas_width / (_data.length - 1))], settings.gapratio);
      y = d3.scale.linear().domain([0, maxv]).range([0, settings.canvas_height - settings.padding * maxn]);
      line = d3.svg.line().x(function (d) { return d.x; }).y(function (d) { return d.y; }).interpolate('basis');

      render();
    }
  };
}());

export default parallelSets;
