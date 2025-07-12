//108个坊的名字
const neighborhoodNames = [
"丰乐坊", "义宁坊", "休祥坊", "修德坊", "光宅坊", "光德坊", "兴化坊", "兴宁坊", "兴庆坊",
"和平坊", "嘉会坊", "大宁坊", "太平坊", "安业坊", "安仁坊", "安兴坊", "安定坊", "安邑坊",
"宜平坊", "宜阳坊", "宣平坊", "居德坊", "崇义坊", "崇仁坊", "崇化坊", "崇德坊", "崇贤坊",
"布政坊", "常乐坊", "平康坊", "延寿坊", "不详", "延福坊", "开化坊", "开明坊", "怀德坊",
"怀远坊", "敦义坊", "敦化坊", "新昌坊", "昭国坊", "晋昌坊", "普宁坊", "曲江坊", "曲池坊",
"来庭坊", "永乐坊", "永兴坊", "永嘉坊", "永平坊", "群贤坊", "胜业坊", "通义坊", "道政坊",
"醴泉坊", "金城坊", "长乐坊", "长寿坊", "青龙坊", "靖善坊", "靖安坊", "颁政坊", "延康坊"
];
// 配置参数
const config = {
  map: {
    svgBounds: [[0, 0], [1065, 934]], // 来自 SVG 的 viewBox
    // svgBounds: [[0, 0], [1000, 1000]],
    minZoom: -5,
    maxZoom: 5
  },
  timeline: {
    // margin: { top: 20, right: 30, bottom: 30, left: 20 },
    margin: { top: 0, right: 100, bottom: 0, left: 100 },
    minYear: 618,
    maxYear: 907
  }
};

// 全局变量
let allMarkers = [];
let currentYear = config.timeline.minYear;
let currentType = 'all';
let map;
let neighborhoodData = [];
let currentBaseLayer;

// 初始化地图
function initMap() {
  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: config.map.minZoom,
    maxZoom: config.map.maxZoom,
  });

  // 初始加载SVG地图（默认灰色底图）
  currentBaseLayer = L.imageOverlay('image/blank-map.svg', config.map.svgBounds);
  currentBaseLayer.addTo(map);
  
  map.fitBounds(config.map.svgBounds);
  const center = L.latLng(
    config.map.svgBounds[1][0]/2-100,
    config.map.svgBounds[1][1]/2
  );
  map.setView(center, -1.5);

  return map;
}

// 自定义图标
const templeIcons = {
  monk: L.icon({
    iconUrl: 'image/monk.svg',
    iconSize: [15, 15]
  }),
  nun: L.icon({
    iconUrl: 'image/nun.svg',
    iconSize: [15, 15]
  }),
  house: L.icon({  // 添加舍宅为寺的图标
    iconUrl: 'image/house.svg',
    iconSize: [15, 15]
  }),
  royal: L.icon({  // 添加皇家寺庙的图标
    iconUrl: 'image/royal.svg',
    iconSize: [15, 15]
  })
};

// 初始化时间轴
function initTimeline() {
  // 定义viewBox的参考尺寸
  const viewBoxWidth = 1500;
  const viewBoxHeight = 100;
  
  const svg = d3.select("#timeline")
    .append("svg")
    .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")

  // 比例尺使用viewBox宽度
  const xScale = d3.scaleLinear()
    .domain([config.timeline.minYear, config.timeline.maxYear])
    .range([config.timeline.margin.left, viewBoxWidth - config.timeline.margin.right]);

  // 绘制时间轴水平轴线
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", viewBoxWidth)
    .attr("y1", viewBoxHeight / 2)
    .attr("y2", viewBoxHeight / 2)
    .attr("stroke", "#CCA475")
    .attr("stroke-width", 5);

  // // 绘制刻度
  // svg.selectAll(".tick")
  //   .data(d3.range(config.timeline.minYear, config.timeline.maxYear + 1, 50))
  //   .enter()
  //   .append("line")
  //   .attr("class", "tick")
  //   .attr("x1", d => xScale(d))
  //   .attr("x2", d => xScale(d))
  //   .attr("y1", viewBoxHeight / 2 - 5)
  //   .attr("y2", viewBoxHeight / 2 + 5)
  //   .attr("stroke", "#999");
  
  // // 绘制标签
  // svg.selectAll(".tick-label")
  //   .data(d3.range(config.timeline.minYear, config.timeline.maxYear + 1, 100))
  //   .enter()
  //   .append("text")
  //   .attr("class", "tick-label")
  //   .attr("x", d => xScale(d) - 20)
  //   .attr("y", viewBoxHeight / 2 + 30)
  //   .text(d => d + "年");
  
  // 特殊年份配置
  const specialYears = [
    { year: 618, label: "唐朝建立（618年）" },
    { year: 755, label: "安史之乱（755年）" },
    { year: 845, label: "会昌法难（845年）" },
    { year: 907, label: "唐朝灭亡（907年）" }
  ];

  // 创建特殊刻度组
  const specialTicks = svg.selectAll(".special-tick")
    .data(specialYears)
    .enter()
    .append("g")
    .attr("class", "special-tick");

  // 添加图标
  specialTicks.append("image")
    .attr("class", "special-tick-image")
    .attr("xlink:href", "image/timeline-tick.svg")
    .attr("x", d => xScale(d.year) - 11)
    .attr("y", viewBoxHeight / 2 - 11)
    .attr("width", 22)
    .attr("height", 22);

  // 添加文字标签
  const labels = specialTicks.append("text")
    .attr("class", "special-tick-label")
    .attr("x", d => xScale(d.year))
    .attr("y", viewBoxHeight / 2 + 28)
    .attr("text-anchor", "middle")
    .text(d => d.label)
    .style("cursor", "pointer")
    .style("fill", "black"); // 确保初始为黑色

  // 添加悬停效果
  labels.on("mouseover", function() {
    d3.select(this).style("fill", "#ff0000");
  }).on("mouseout", function() {
    d3.select(this).style("fill", "black");
  });


  // 获取工具tip元素
  const yearTooltip = d3.select("#year-tooltip");

  // 修复后的拖动柄
  const handle = svg.append("circle")
    .attr("class", "handle")
    .attr("cx", xScale(currentYear))
    .attr("cy", viewBoxHeight / 2)
    .attr("r", 8)
    .call(d3.drag()
      .on("start", function() {
        d3.select(this).classed("dragging", true);
        yearTooltip.style("display", "block");
      })
      .on("drag", function(event) {
        const svgNode = svg.node();
        const pt = svgNode.createSVGPoint();
        pt.x = event.sourceEvent.clientX;
        pt.y = event.sourceEvent.clientY;
        const cursor = pt.matrixTransform(svgNode.getScreenCTM().inverse());
        
        const year = Math.max(
            config.timeline.minYear,
            Math.min(config.timeline.maxYear, Math.round(xScale.invert(cursor.x)))
        );
        
        currentYear = year;
        updateMarkers();
        
        // 更新手柄位置
        d3.select(this).attr("cx", xScale(year));
        
        // 获取游标在屏幕上的位置
        const handleScreenCoords = getScreenCoords(svgNode, xScale(year), viewBoxHeight / 2);
        
        // 设置提示框位置（游标正上方）
        const tooltip = document.getElementById("year-tooltip");
        yearTooltip
            .style("left", `${handleScreenCoords.x - tooltip.offsetWidth / 2}px`)
            .style("top", `${handleScreenCoords.y - 50}px`)  // 40px 是提示框高度 + 间距
            .text(`${year}年`);
      })
      .on("end", function() {
        d3.select(this).classed("dragging", false);
        yearTooltip.style("display", "none");
      }));
}

// 辅助函数：将 SVG 坐标转换为屏幕坐标
function getScreenCoords(svgNode, x, y) {
    const pt = svgNode.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const screenCoords = pt.matrixTransform(svgNode.getScreenCTM());
    return {
        x: screenCoords.x,
        y: screenCoords.y
    };
}

// function updateYearDisplay() {
//   document.getElementById("year-display").textContent = `${currentYear}年`;
// }

function updateMarkers() {
  //checkedTypes储存各个复选框中被选了哪些type
  const checkboxes = document.querySelectorAll('.control-panel .filter-checkbox');
  const checkedTypes = [];

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      checkedTypes.push(checkbox.value);
    }
  });

  allMarkers.forEach(({ marker, type, build_year, abandon_year }) => {
    const typeMatch = checkedTypes.includes(type);
    console.log(build_year);
    const yearMatch = (build_year <= currentYear) && (currentYear <= abandon_year);
    const isVisible = typeMatch && yearMatch;

    if (isVisible) {
      if (!map.hasLayer(marker)) {
        marker.addTo(map);
      }
      marker.setOpacity(1);
    } else {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    }
  });
}

function getSvgCoord(templex, templey){
  var svgx=-50, svgy=-50;
  switch(templex){
    case 1:
      svgx = 60 + (-22+Math.random()*44); break;
    case 2:
      svgx = 165 + (-22+Math.random()*44); break;
    case 3:
      svgx = 270 + (-22+Math.random()*44); break;
    case 4:
      svgx = 363 + (-22+Math.random()*44); break;
    case 5:
      svgx = 430 + (-22+Math.random()*44); break;
    case 6:
      svgx = 507 + (-22+Math.random()*44); break;
    case 7:
      svgx = 574 + (-22+Math.random()*44); break;
    case 8:
      svgx = 667 + (-22+Math.random()*44); break;
    case 9:
      svgx = 772 + (-22+Math.random()*44); break;
    case 10:
      svgx = 877 + (-22+Math.random()*44); break;
    default:
      svgx = -500;
  }
  switch(templey){
    case 1:
      svgy = 1030 + (-15+Math.random()*30); break;
    case 2:
      svgy = 975 + (-15+Math.random()*30); break;
    case 3:
      svgy = 920 + (-15+Math.random()*30); break;
    case 4:
      svgy = 865 + (-15+Math.random()*30); break;
    case 5:
      svgy = 810 + (-15+Math.random()*30); break;
    case 6:
      svgy = 755 + (-15+Math.random()*30); break;
    case 7:
      svgy = 700 + (-15+Math.random()*30); break;
    case 8:
      svgy = 640 + (-15+Math.random()*30); break;
    case 9:
      svgy = 585 + (-15+Math.random()*30); break;
    case 10:
      svgy = 510 + (-15+Math.random()*30); break;
    case 11:
      svgy = 425 + (-15+Math.random()*30); break;
    case 12:
      svgy = 340 + (-15+Math.random()*30); break;
    case 13:
      svgy = 275 + (-15+Math.random()*30); break;
    default:
      svgy = 1000;
  }
  return [svgx, svgy];
}

//主函数
document.addEventListener('DOMContentLoaded', () => {
  map = initMap();
  const checkboxes = document.querySelectorAll('.filter-checkbox');//选择所有复选框

  // 单选按钮事件监听
  const radioButtons = document.querySelectorAll('input[name="map-type"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        changeBaseMap(this.value);
      }
    });
  });

  fetch('data/neighborhood.json')
    .then(res => res.json())
    .then(data => {
      neighborhoodData = data;
    });

  let neighborhoodStats = [];
  fetch('data/neighborhood-temple-count.json')
    .then(res => res.json())
    .then(data => {
      neighborhoodStats = data;
    });
  
  function updateNeighborhoodPercents() {
    const checkedTypes = Array.from(document.querySelectorAll('.control-panel .filter-checkbox'))
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    // 特殊逻辑：monk + nun 同时选时，不显示任何百分比
    const showPercent = !(checkedTypes.includes('monk') && checkedTypes.includes('nun'));

    document.querySelectorAll('.neighborhood-item').forEach(item => {
      const name = item.firstChild.textContent.trim();
      const span = item.querySelector('.neighborhood-percent');
      const stat = neighborhoodStats.find(d => d.name === name);
      if (!stat || !showPercent || checkedTypes.length === 0) {
        span.textContent = '';
      } else {
        // 只允许有一个 checkbox 被选中
        const type = checkedTypes[0];
        const count = stat[type] || 0;
        const pct = Math.round(100 * count / stat.total);
        span.textContent = pct + '%';
      }
    });
  }


  
  //添加地图和地图上的寺庙图标
  fetch('data/temples.json')
    .then(res => res.json())
    .then(temples => {
      allMarkers = temples.map(temple => {
        const [svgx, svgy] = getSvgCoord(temple.x, temple.y);
        const marker = L.marker(
          [config.map.svgBounds[1][0]-svgy, svgx],
          // [config.map.svgBounds[1][0]-temple.y, temple.x],
          {
            icon: templeIcons[temple.type],
            opacity: 0,
          }
        ).addTo(map);

        marker.bindPopup(`
          <h3>${temple.name}</h3>
          <p><strong>类型：</strong>${temple.type === 'monk' ? '僧寺' : temple.type === 'nun' ? '尼寺' : '皇家寺庙'}</p>
          <p><strong>建立年份：</strong>${temple.build_year == 100 ? '延续隋代' : temple.build_year == 0 ? '不详' : temple.build_year + '年'}</p>
          <p><strong>废弃年份：</strong>${temple.abandon_year == '999' ? '保留' : temple.abandon_year + '年'}</p>
          <p><strong>位置：</strong>${temple.location}</p>
        `, {
          maxWidth: 300,
          minWidth: 200,
          className: 'temple-popup' // 添加自定义类名以便样式化
        });

        return {
          marker,
          type: temple.type,
          build_year: temple.build_year,
          abandon_year: temple.abandon_year
        };
      });

      initTimeline();
      updateMarkers();
    });
  
  // 添加坊名列表
  const columns = document.querySelectorAll('.neighborhood-column');
  const half = Math.ceil(neighborhoodNames.length / 2);
  // 第一列
  neighborhoodNames.slice(0, half).forEach(name => {
    const item = document.createElement('div');
    item.className = 'neighborhood-item';
    item.innerHTML = `${name}<span class="neighborhood-percent"></span>`;
    item.addEventListener('click', () => showTempleIcons(name));
    columns[0].appendChild(item);
  });
  // 第二列
  neighborhoodNames.slice(half).forEach(name => {
    const item = document.createElement('div');
    item.className = 'neighborhood-item';
    item.innerHTML = `${name}<span class="neighborhood-percent"></span>`;
    item.addEventListener('click', () => showTempleIcons(name));
    columns[1].appendChild(item);
  });

  updateNeighborhoodPercents();

  // 显示寺庙图标
  function showTempleIcons(neighborhoodName) {
    // console.log(`被点击的坊名字: ${neighborhoodName}`);
    
    const container = document.getElementById('temple-icons-container');
    container.innerHTML = '';
    
    const data = neighborhoodData.find(item => item.name === neighborhoodName);
    if (!data) return;
    
    createTempleIcons(container, 'monk', data.monk);
    createTempleIcons(container, 'nun', data.nun);
    createTempleIcons(container, 'royal', data.royal);
    createTempleIcons(container, 'house', data.house);
  }

  //显示每5个一行的寺庙图标
  function createTempleIcons(container, type, count) {
    if (count <= 0) return;
    
    const iconMap = {
      monk: 'image/monk.svg',
      nun: 'image/nun.svg',
      royal: 'image/royal.svg',
      house: 'image/house.svg' 
    };
    
    let remaining = count;
    
    while (remaining > 0) {
      const row = document.createElement('div');
      row.className = 'temple-row';
      
      const iconsInRow = Math.min(5, remaining);
      for (let i = 0; i < iconsInRow; i++) {
        const icon = document.createElement('img');
        icon.src = iconMap[type];
        icon.className = 'temple-icon';
        icon.alt = type;
        row.appendChild(icon);
      }
      
      container.appendChild(row);
      remaining -= iconsInRow;
    }
  }

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      handleCheckboxExclusion(this);
    });
  });
  
  // 切换底图函数
  function changeBaseMap(mapType) {
    let newLayer;
    switch(mapType) {
      case 'blank':
        newLayer = L.imageOverlay('image/blank-map.svg', config.map.svgBounds);
        break;
      case 'labeled':
        newLayer = L.imageOverlay('image/neighborhood-name-map.svg', config.map.svgBounds);
        break;
      case 'functional':
        newLayer = L.imageOverlay('image/function-map.svg', config.map.svgBounds);
        break;
      default:
        newLayer = L.imageOverlay('image/blank-map.svg', config.map.svgBounds);
    }
    
    // 移除旧底图，添加新底图
    map.removeLayer(currentBaseLayer);
    currentBaseLayer = newLayer.addTo(map);
  }

  // 添加互斥逻辑处理函数
  function handleCheckboxExclusion(checkbox) {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    const royalCheckbox = document.getElementById('filter-royal');
    const houseCheckbox = document.getElementById('filter-house');
    const monkCheckbox = document.getElementById('filter-monk');
    const nunCheckbox = document.getElementById('filter-nun');

    // 获取当前复选框的值和状态
    const value = checkbox.value;
    const isChecked = checkbox.checked;

    // (1) 皇家寺庙被选中
    if (value === 'royal' && isChecked) {
      houseCheckbox.checked = false;
      monkCheckbox.checked = false;
      nunCheckbox.checked = false;
    }
    
    // (2) 舍宅为寺被选中
    if (value === 'house' && isChecked) {
      royalCheckbox.checked = false;
      monkCheckbox.checked = false;
      nunCheckbox.checked = false;
    }
    
    // (3) 和尚庙被选中
    if (value === 'monk' && isChecked) {
      royalCheckbox.checked = false;
      houseCheckbox.checked = false;
      // 尼姑庵保留原状态
    }
    
    // (4) 尼姑庵被选中
    if (value === 'nun' && isChecked) {
      royalCheckbox.checked = false;
      houseCheckbox.checked = false;
      // 和尚庙保留原状态
    }
    // 更新地图标记
    updateMarkers();
    updateNeighborhoodPercents();
  }
  
  // document.getElementById('temple-type').addEventListener('change', function () {
  //   currentType = this.value;
  //   updateMarkers();
  // });
});
