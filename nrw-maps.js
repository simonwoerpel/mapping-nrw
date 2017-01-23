// base map
const baseMap = d3.playbooks.choroplethMap({
  elementId: 'base-map',
  responsiveSvg: true,
  geoDataUrl: './data/nrw.topo.json',
  dataUrl: './data/nrw-gender.csv',
  isTopojson: true,
  topojsonLayerName: 'gemeinden_simplify20',
  getId: f => f.properties.RS.substring(1),
  color: d3.schemeBuPu[9],
  width: 800,
  height: 800,
  cssNamespace: 'nrw-map-base',
}).render().infobox({
  element: '.nrw-map-base__infobox',
  template: `<h3>{GEN}</h3>
    <p><strong>Anteil: {value} %</strong></p>
    <p>Bevölkerung: {population}</p>`
    // <p>Frauen: {population_w}</p>
    // <p>Männer: {population_m}</p>
  // `
})

// kreisfreie cities, one shape each
baseMap.ready().then(() => {

  const features = baseMap.features()

  // visual alignement:
  const cityAlign = [
    // [null, null, null, null, null, "Bielefeld"],
    // [null, null, null, null, "Münster", "Hamm",],
    // [null, null, "Oberhausen", "Bottrop", "Gelsenkirchen", "Herne"],
    // ["Krefeld", "Duisburg", "Mülheim an der Ruhr", "Essen", "Bochum", "Dortmund"],
    // ["Mönchengladbach", "Düsseldorf", "Solingen", "Wuppertal", "Hagen"],
    // ["Köln", "Leverkusen", "Remscheid"],
    // ["Bonn"]
    [null, null, null, "Münster", "Bielefeld"],
    ["Oberhausen", "Bottrop", "Gelsenkirchen", "Herne", "Hamm"],
    ["Duisburg", "Mülheim an der Ruhr", "Essen", "Bochum", "Dortmund"],
    ["Mönchengladbach", "Krefeld", "Düsseldorf", "Solingen", "Wuppertal"],
    ["Köln", "Leverkusen", "Remscheid", "Hagen", "Bonn"]
  ]

  // color
  const domain = d3.extent(features.map(f => f.value))
  const getColor = d3.scaleQuantile().domain(domain).range(baseMap.color())

  const cities = {}
  features.filter(f => f.BEZ === 'Stadt').map(f => cities[f.GEN] = f)

  const width = 50, height = 50

  const getSvgGroup = element => {
    return element
      .append('div')
        .attr('class', 'nrw-map-single__wrapper svg-container-responsive')
      .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .classed('svg-content-responsive', true)
        .classed('nrw-map-single__svg', true)
      .append('g')
  }

  const getPath = data => {
    return d3.geoPath()
      .projection(d3.geoMercator().fitSize([width, height], data))
  }

  const format = d3.format('.1f')

  // draw cities
  cityAlign.map((row, i) => {
    const element = d3.select('.nrw-map-singles').append('div')
      .attr('class', 'nrw-map-singles__row')

    // legend for first iteration
    if (i === 0) {
      const legend = element.append('div').attr('class', 'nrw-map__legend')
      const legendData = getColor.quantiles()
      legend.append('h3')
        .text('Anteil weiblicher Bevölkerung in %')
      // labels row
      legend.append('div').attr('class', 'nrw-map__legend-row nrw-map__legend-row--labels').selectAll('span')
        .data(legendData).enter()
          .append('span')
          .text(d => format(d))
      // color row
      legend.append('div').attr('class', 'nrw-map__legend-row nrw-map__legend-row--colors').selectAll('span')
        .data(legendData).enter()
          .append('span')
          .style('background-color', d => getColor(d))
    }

    row.map(name => {
      if (!name) {
        // empty placeholder
        // element.append('div').attr('class', 'nrw-map-single nrw-map-single--empty')
      } else {
        const f = cities[name]
        const path = getPath(f)
        const getName = name => {  // FIXME
          return name === 'Mülheim an der Ruhr' ? 'Mülheim' :
            name === 'Mönchengladbach' ? 'Gladbach' : name
        }
        const singleEl = element.append('div')
          .attr('id', 'rs-' + f.RS)
          .attr('class', 'nrw-map-single')
        singleEl.append('h3').text(getName(f.GEN))
        singleEl.append('p').text(format(f.value) + ' %')
        const svg = getSvgGroup(singleEl)
        svg.selectAll('path').data([f])
          .enter().append('path')
            .attr('class', 'nrw-map-single__feature')
            .attr('d', path)
            .attr('fill', d => getColor(d.value))
          .on('mouseover', d => {
            baseMap.hilight(d.RS.substring(1))
            baseMap.control().trigger('update_infobox', d)
          })
          .on('mouseout', d => {
            baseMap.unhilight()
            baseMap.control().trigger('empty_infobox')
          })
      }
    })
  })
})
