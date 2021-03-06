'use strict';

var React = require('react');
var Legend = require('../Legend');

module.exports = React.createClass({

  displayName: 'LegendChart',

  propTypes: {
    title: React.PropTypes.node,
    viewBox: React.PropTypes.string,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    children: React.PropTypes.node,
    legend: React.PropTypes.bool,
    legendPosition: React.PropTypes.string,
    sideOffset: React.PropTypes.number,
    margins: React.PropTypes.object,
    data: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array
    ])
  },

  getDefaultProps() {
    return {
      data: {},
      legend: false,
      legendPosition: 'right',
      sideOffset: 90
    };
  },

  _renderLegend() {
    if (this.props.legend) {
      return (
        <Legend 
          legendPosition={this.props.legendPosition}
          margins={this.props.margins}
          colors={this.props.colors}
          data={this.props.data}
          width={this.props.width}
          height={this.props.height}
          sideOffset={this.props.sideOffset}
        /> 
      );
    }
  },

  _renderTitle() {
    if (this.props.title != null) {
      return (
        <h4>{this.props.title}</h4>
      );
      return null;
    }
  },

  render() {
    return (
      <div style={{'width': this.props.width, 'height': this.props.height}} >
        {this._renderTitle()}
        {this._renderLegend()}
        <svg viewBox={this.props.viewBox} width={this.props.width - this.props.sideOffset} height={this.props.height}>{this.props.children}</svg>
      </div>
    );
  }
});
