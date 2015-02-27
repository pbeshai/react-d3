'use strict';

var React = require('react');
var d3 = require('d3');
var utils = require('../utils');
var Candle = require('./Candle');
var Wick = require('./Wick');


module.exports = React.createClass({

  propTypes: {
    fillUp: React.PropTypes.string.isRequired,
    fillDown: React.PropTypes.string.isRequired
  },

  render() {

    var props = this.props;

    var xRange = this.props.xScale.range(),
        width = Math.abs(xRange[0] - xRange[1]),
        candleWidth = (width / (this.props.data.length + 2)) * 0.5;

    var dataSeries = this.props.data
        .map((d, idx)=> {
          // Candles
          var ohlc = this.props.yAccessor(d),
            x = this.props.xScale(this.props.xAccessor(d)) - 0.5 * candleWidth,
            y = this.props.yScale(Math.max(ohlc.open, ohlc.close)),
            height = Math.abs(this.props.yScale(ohlc.open) - this.props.yScale(ohlc.close)),
            y2 = this.props.yScale(ohlc.low),
            ohlcClass = (ohlc.open <= ohlc.close) ? 'up' : 'down',
            className = `${ ohlcClass } rd3-candlestick-rect`,
            fill = (ohlc.open <= ohlc.close) ? this.props.fillUp : this.props.fillDown;

          //Wicks
          var x1 = this.props.xScale(this.props.xAccessor(d)),
            y1 = this.props.yScale(ohlc.high),
            x2 = x1,
            y2 = this.props.yScale(ohlc.low);

          // Create unique id: series + index
          var id = props.series.name + '-' + idx;

          // Create an immstruct reference for the candle id
          // and set it to 'inactive'
          props.structure.cursor('voronoi').set(id, 'inactive');

          // Having set the Voronoi circle id cursor to 'inactive'
          // We now pass on the Voronoi circle id reference to the 
          // circle component, where it will be observed and dereferenced
          var voronoiRef = props.structure.reference(['voronoi', id]);


          return (
            <g key={idx} >
              <Wick
                x1={x1}
                x2={x2}
                y1={y1}
                y2={y2}
              />
              <Candle
                voronoiRef={voronoiRef}
                fill={fill}
                id={id}
                x={x}
                y={y}
                width={candleWidth}
                height={height}
              />
            </g>
          );
        }, this);

    return (
      <g>
        {dataSeries}
      </g>
    );
  }

});



var CandlestickChart = exports.CandlestickChart = React.createClass({

  propTypes: {
    data: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    yAxisTickCount: React.PropTypes.number,
    yAxisFormatter: React.PropTypes.func,
    yAccessor: React.PropTypes.func,
    xAxisTickInterval: React.PropTypes.object,
    xAxisFormatter: React.PropTypes.func,
    xAccessor: React.PropTypes.func,
    fillUp: React.PropTypes.func,
    fillDown: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    title: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      data: [],
      fillUp: (i) => "white",
      fillDown: d3.scale.category20c(),
      margins: {top: 10, right: 20, bottom: 30, left: 40},
      legendOffset: 120,
      width: 400,
      height: 200,
      title: '',
      xAccessor: (d) => d.x,
      yAccessor: (d) => ({ open: d.open, high: d.high, low: d.low, close: d.close })
    };
  },

  render() {

    var structure = immstruct('candlestickChart', { voronoi: {} });

    var props = this.props;

    // Calculate inner chart dimensions
    var chartWidth, chartHeight;
    chartWidth = props.width - props.margins.left - props.margins.right;
    chartHeight = props.height - props.margins.top - props.margins.bottom;

    if (props.legend) {
      chartWidth = chartWidth - props.legendOffset;
    }

    if (!Array.isArray(props.data)) {
      props.data = [props.data];
    }

    var flattenedData = utils.flattenData(props.data, props.xAccessor, props.yAccessor);

    var allValues = flattenedData.allValues,
        xValues = flattenedData.xValues,
        yValues = flattenedData.yValues;


    var scales = utils.calculateScales(chartWidth, chartHeight, xValues, yValues);

    var trans = "translate(" + (props.yAxisOffset < 0 ? props.margins.left + Math.abs(props.yAxisOffset) : props.margins.left) + "," + props.margins.top + ")";

    var dataSeries = props.data.map( (series, idx) => {
      return (
          <DataSeries
            structure={structure}
            series={series}
            key={idx}
            name={series.name}
            colors={props.colors}
            index={idx}
            xScale={scales.xScale}
            yScale={scales.yScale}
            data={series.values}
            fillUp={this.props.fillUp(idx)}
            fillDown={this.props.fillDown(idx)}
            xAccessor={props.xAccessor}
            yAccessor={props.yAccessor}
          />
        );
      });

    return (
      <Chart
        width={this.props.width}
        height={this.props.height}
        margins={this.props.margins}
        title={this.props.title}
      >
        <g transform={trans} className="rd3-candlestick">
          {dataSeries}
          <Voronoi
            structure={structure}
            data={allValues}
            xScale={scales.xScale}
            yScale={scales.yScale}
            width={chartWidth}
            height={chartHeight}
          />
          <XAxis
            xAxisClassName="rd3-candlestick-xaxis"
            xScale={scales.xScale}
            xAxisTickInterval={props.xAxisTickInterval}
            xAxisOffset={props.xAxisOffset}
            xAxisFormatter={props.xAxisFormatter}
            margins={props.margins}
            width={chartWidth}
            height={chartHeight}
          />
          <YAxis
            yAxisClassName="rd3-candlestick-yaxis"
            yScale={scales.yScale}
            yAxisOffset={props.yAxisOffset}
            yAxisTickCount={props.yAxisTickCount}
            yAxisFormatter={props.yAxisFormatter}
            margins={props.margins}
            width={chartWidth}
            height={props.height}
          />
        </g>
      </Chart>
    );
  }

});