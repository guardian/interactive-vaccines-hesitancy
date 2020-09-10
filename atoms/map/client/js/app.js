import * as d3 from 'd3'
import * as topojson from 'topojson'
import geoLand from 'world-atlas/land-50m.json'
import geoCountry from 'world-atlas/countries-50m.json'
import * as geoProjection from 'd3-geo-projection'

const land = topojson.feature(geoLand, geoLand.objects.land);
const countries = topojson.feature(geoCountry, geoCountry.objects.countries).features;

let countriesFiltered = countries.filter(d => d.id != '010')

let isMobile = window.matchMedia('(max-width: 700px)').matches;

const atomEl = d3.select('.interactive-wrapper').node();

let width = atomEl.getBoundingClientRect().width;
let height =  width * 2.5 / 4;

let extent = {
        type: "LineString",
        /*coordinates: [

            [minLon, maxLat],
            [maxLon, maxLat],
            [maxLon, minLat],
            [minLon, minLat],
        ]*/

         coordinates: [
            [-89.99999, 40],
            [89.99999, 40],
            [89.99999, -40],
            [-89.99999, -40],
        ]
    }


let colorScale = d3.scaleThreshold()
.domain([20, 40, 60, 80, 100])
.range(['#333333','#CC0A11','#ED6300','#F5BE2C','#FFE500']);

let projection = geoProjection.geoWinkel3()
.fitExtent([[0, 0], [width, height]], extent);

let path = d3.geoPath()
.projection(projection)

let svg = d3.select('.interactive-wrapper').append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'gv-vaccine-hesitancy-map')

let bg = svg.append('g')
.selectAll('.map-fill')
.data(countriesFiltered)
.enter()
.append("path")
.attr('class', 'bg')
.attr("d", path)
.attr('stroke', 'none')
.attr('fill', '#dadada')
.attr('pointer-events', 'none')

let maphightlight;

d3.json('https://interactive.guim.co.uk/docsdata-test/1Qumc1-G7fRP-VCjXrH8_kFdly6ciO3RN1RAWk2sQo7c.json').then(response => {

	let map = svg.append('g')
	.selectAll('.map-fill')
	.data(countriesFiltered)
	.enter()
	.append("path")
	.attr('class', d => 'c' + d.id)
	.attr('stroke-width','1px')
	.attr('stroke','#FFFFFF')
	.on("mouseover", event => {console.log(event); highlight(event.target.attributes[0].nodeValue.split('c')[1])})
	.on("mouseout", event => resetHighlight())
	.on("mousemove", (event) => mousemove(event,event.target.attributes[0].nodeValue.split('c')[1]))
	.attr('opacity', 0)
	.attr("d", path)

	maphightlight = svg.append('g')
	.selectAll('.map-fill')
	.data(countriesFiltered)
	.enter()
	.append("path")
	.attr('class', d => 'map-stroke h' + d.id)
	.attr('fill','none')
	.attr('stroke-width','1.5px')
	.attr("d", path)
	.attr('pointer-events', 'none')
	.attr('stroke-linecap', 'round')
	

	response.sheets['map'].map(entry => {


		let id;

		if(+entry.id < 100 && +entry.id > 9)id = '0' + entry.id;
		else if(+entry.id < 10 && +entry.id > 0)id = '00' + entry.id;
		else id = entry.id


		d3.select('.c' + id)
		.attr('fill', colorScale(+entry['per-dec-19']))
		.attr('opacity', 1)

	})

})

const mousemove = (event, value) => {

	/*console.log(d3.pointer(event))*/

	let here = d3.pointer(event);

    let left = here[0];
    let top = here[1];
    let tWidth = d3.select('.interactive-wrapper .tooltip-wrapper').node().getBoundingClientRect().width;
    let tHeight = d3.select('.interactive-wrapper .tooltip-wrapper').node().getBoundingClientRect().height;

    let posX = left;
    let posY = top;

    if(posX + tWidth > width)posX = width - tWidth - 2

    d3.select('.tooltip-wrapper').style('left',  posX + 'px')
    d3.select('.tooltip-wrapper').style('top', posY + 'px')

}


const highlight = (value) => {

	d3.select('.h' + value)
	.style('stroke', '#333333')

}

const resetHighlight = () => {

	d3.selectAll('.map-stroke')
	.style('stroke', 'none')
}














