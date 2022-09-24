var phaseIndexLiquid;
var phaseIndexMixed;
var phaseIndexVapor;
var phaseIndexSupCrit;
var state = {};

convertToSI = {
  '-': (x) => x,
  '%': (x) => x / 100,
  'K': (x) => x,
  '°C': (x) => x + 273.15,
  'Pa': (x) => x,
  'kPa': (x) => x * 1000,
  'MPa': (x) => x * 1e6,
  'kg/m^3': (x) => x,
  'J/kg': (x) => x,
  'kJ/kg': (x) => x * 1000,
  'J/(kg*K)': (x) => x,
  'kJ/(kg*K)': (x) => x * 1000
};

convertFromSI = {
  '-': (x) => x,
  '%': (x) => x * 100,
  'K': (x) => x,
  '°C': (x) => x - 273.15,
  'Pa': (x) => x,
  'kPa': (x) => x / 1000,
  'MPa': (x) => x / 1e6,
  'kg/m^3': (x) => x,
  'J/kg': (x) => x,
  'kJ/kg': (x) => x / 1000,
  'J/(kg*K)': (x) => x,
  'kJ/(kg*K)': (x) => x / 1000
};

const variables = {
  'Q': { name: 'Quality', units: ['-', '%'], calc: (in1, in2, fluid) => Module.PropsSI('Q', in1.variable, in1.value, in2.variable, in2.value, fluid) },
  'T': { name: 'Temperature', units: ['°C', 'K'], calc: (in1, in2, fluid) => Module.PropsSI('T', in1.variable, in1.value, in2.variable, in2.value, fluid) },
  'P': { name: 'Pressure', units: ['kPa', 'Pa', 'MPa'], calc: (in1, in2, fluid) => Module.PropsSI('P', in1.variable, in1.value, in2.variable, in2.value, fluid) },
  'D': { name: 'Density', units: ['kg/m^3'], calc: (in1, in2, fluid) => Module.PropsSI('D', in1.variable, in1.value, in2.variable, in2.value, fluid) },
  'U': { name: 'spec Energy', units: ['kJ/kg', 'J/kg'], calc: (in1, in2, fluid) => Module.PropsSI('U', in1.variable, in1.value, in2.variable, in2.value, fluid) },
  'H': { name: 'spec Enthalpy', units: ['kJ/kg', 'J/kg'], calc: (in1, in2, fluid) => Module.PropsSI('H', in1.variable, in1.value, in2.variable, in2.value, fluid) },
  'S': { name: 'spec Entropy', units: ['kJ/(kg*K)', 'J/(kg*K)'], calc: (in1, in2, fluid) => Module.PropsSI('S', in1.variable, in1.value, in2.variable, in2.value, fluid) }
};

const elements = {
  fluid: document.getElementById('fluid'),
  plot_type: document.getElementById('plot_type'),
  plot_window: document.getElementById('plot_window'),
  
  in1Var: document.getElementById('in1Var'),
  in1Value: document.getElementById('in1Value'),
  in1Units: document.getElementById('in1Units'),

  in2Var: document.getElementById('in2Var'),
  in2Value: document.getElementById('in2Value'),
  in2Units: document.getElementById('in2Units'),
  
  outPhase: document.getElementById('outPhase'),

  outQValue: document.getElementById('outQValue'),
  outTValue: document.getElementById('outTValue'),
  outPValue: document.getElementById('outPValue'),
  outDValue: document.getElementById('outDValue'),
  outUValue: document.getElementById('outUValue'),
  outHValue: document.getElementById('outHValue'),
  outSValue: document.getElementById('outSValue'),

  outQUnits: document.getElementById('outQUnits'),
  outTUnits: document.getElementById('outTUnits'),
  outPUnits: document.getElementById('outPUnits'),
  outDUnits: document.getElementById('outDUnits'),
  outUUnits: document.getElementById('outUUnits'),
  outHUnits: document.getElementById('outHUnits'),
  outSUnits: document.getElementById('outSUnits')
};

function getInput(n) {
  input = {
    variable: elements[`in${n}Var`].value,
    value: parseFloat(elements[`in${n}Value`].value),
    units: elements[`in${n}Units`].value
  };
  input.value = convertToSI[input.units](input.value);
  return input;
};

function updateSecondInputVariables() {
  deleteAllOptions(elements.in2Var);
  addOptions(elements.in2Var, Object.keys(variables), Object.values(variables).map(x => x.name))
  elements.in2Var.remove(elements.in1Var.selectedIndex);
};

function updateInputUnits() {
  deleteAllOptions(elements.in1Units);
  deleteAllOptions(elements.in2Units);
  addOptions(elements.in1Units, variables[elements.in1Var.value].units, variables[elements.in1Var.value].units);
  addOptions(elements.in2Units, variables[elements.in2Var.value].units, variables[elements.in2Var.value].units);
};

function updateOutputUnits() {
  for (variable of Object.keys(variables)) {
    addOptions(elements[`out${variable}Units`], variables[variable].units, variables[variable].units);
  };
};

function deleteAllOptions(selectElement) {
  for (i = selectElement.length - 1; i >= 0; i--) {
    selectElement.remove(i);
  };
};

function addOptions(selectElement, values, innerText) {
  for (let i = 0; i < values.length; i++) {
    let opt = document.createElement('option');
    opt.value = values[i];
    opt.innerText = innerText[i];
    selectElement.options.add(opt);
  };
};

function getPhase() {
  fluid = elements.fluid.value;
  const in1 = getInput(1);
  const in2 = getInput(2);
  let phaseIndex = Module.PropsSI('Phase', in1.variable, in1.value, in2.variable, in2.value, fluid);
  if (!phaseIndexLiquid) { phaseIndexLiquid = Module.PropsSI('Phase', 'T', 300, 'P', 101000, 'Water'); };
  if (!phaseIndexMixed) { phaseIndexMixed = Module.PropsSI('Phase', 'T', 450, 'Q', .5, 'Water'); };
  if (!phaseIndexVapor) { phaseIndexVapor = Module.PropsSI('Phase', 'T', 450, 'P', 101000, 'Water'); };
  if (!phaseIndexSupCrit) { phaseIndexSupCrit = Module.PropsSI('Phase', 'T', 300, 'P', 24000000, 'Water'); };

  switch (phaseIndex) {
    case phaseIndexLiquid:
      return "Compressed Liquid";      
    case phaseIndexMixed:
      return "Saturated Mixture";
    case phaseIndexVapor:
      return "Superheated Vapor";
    case phaseIndexSupCrit:
      return "Super Critical";
    default:
      return "Unknown";
  }

}


function calculate() {
  let fluid = elements.fluid.value;
  const in1 = getInput(1);
  const in2 = getInput(2);

  for (variable of Object.keys(variables)) {
    state[variable] = variables[variable].calc(in1, in2, fluid);
  };

  
  for (variable of Object.keys(variables)) {
    elements[`out${variable}Value`].innerText = convertFromSI[elements[`out${variable}Units`].value](state[variable]).toPrecision(4);
  };
  
  elements.outQValue.innerText = ((state.Q <= 1) & (state.Q >= 0)) ? elements.outQValue.innerText : "N/A";
  
  elements.outPhase.innerText = getPhase();

  plot_state();

};


function initialize() {
  updateSecondInputVariables();
  updateInputUnits();
  updateOutputUnits();
  property_plot();
};


function PH_plot() {
  let fluid = elements.fluid.value;
  plot_data = (fluid == 'Water') ? PH_Water_data : PH_R134a_data;
  
  const sat_dome_trace = {
    x: plot_data.H_sat_dome,
    y: plot_data.P_sat_dome,
    name: 'saturation dome',
    type: 'scatter',
    hoverinfo: 'skip'
  }
  
  const V_trace = {
    x: plot_data.H,
    y: plot_data.P,
    z: plot_data.V,
    type: 'contour',
    name: 'V (m^3/kg)',
    showscale: false,
    hoverongaps: false,
    autocontour: false,
    contours: {
      start: .001,
      coloring: 'none',
      showlabels: true,
    },
    line: {
      dash: "longdash"
    },
    hovertemplate: 'V: %{z:.3g} (m^3/kg)<extra></extra>',
  }

  const D_trace = {
    x: plot_data.H,
    y: plot_data.P,
    z: plot_data.D,
    type: 'contour',
    name: 'D (kg/m^3)',
    showscale: false,
    hoverongaps: false,
    contours: {
      coloring: 'none',
      showlabels: true,
    },
    line: {
      dash: "dashdot"
    },
    hovertemplate: 'D: %{z:4.2g} (kg/m^3)<extra></extra>',
  }
  const S_trace = {
    x: plot_data.H,
    y: plot_data.P,
    z: plot_data.S,
    type: 'contour',
    name: 'S (J/(kg*K))',
    showscale: false,
    hoverongaps: false,
    contours: {
      coloring: 'none',
      showlabels: true,
    },
    line: {
      dash: "dot"
    },
    hovertemplate: 'S: %{z:d} (J/(kg*K))<extra></extra>',
  }
  const Q_trace = {
    x: plot_data.H,
    y: plot_data.P,
    z: plot_data.Q,
    type: 'contour',
    name: 'Q (-)',
    autocontour: true,
    contours: {
      start: 0.1,
      size: .1,
      end: 0.9,
      coloring: "none",
      labelformat: ".1f",
      showlabels: true,
    },
  
    line: {
      dash: "dash",
    },
  
    zmax: 1,
    zmin: 0,
  
    showscale: false,
    hoverongaps: false,
    hovertemplate: 'Q: %{z:0.2f}<extra></extra>',
  }
  const T_trace = {
    x: plot_data.H,
    y: plot_data.P,
    z: plot_data.T,
    type: 'contour',
    name: 'T (K)',
    showscale: false,
    hoverongaps: false,
    contours: {
      coloring: 'none',
      showlabels: true,
    },
    line: {
      dash: "solid"
    },
    hovertemplate: 'H: %{x:1.2e} J/kg<br>P: %{y:1.2e} Pa<br>T: %{z:1.0d}K<extra></extra>',
  }

  const state_trace = {
    x: [],
    y: [],
    name: 'state',
    type: 'scatter',
    mode: 'markers',
    hoverinfo: 'skip',
    marker: {
      size: 12,
    }
  }
  
  const data = [sat_dome_trace, D_trace, S_trace, Q_trace, T_trace, state_trace]
  
  const layout = {
    title: `${fluid} P-H diagram`,
    showlegend: true,
    legend: {
      orientation: 'h',
      x: .5,
      xanchor: 'center',
      y: 1.05,
    },
    hovermode: 'x',
    xaxis: {
      title: 'H (J/kg)',
      text: 'H (J/kg)'
    },
    yaxis: {
      title: 'P (Pa)',
      text: 'P (Pa)',
      type: 'log'
    }
  }
  
  Plotly.newPlot('plot_window', data, layout, {responsive: true});
}

function TS_plot() {
  let fluid = elements.fluid.value;
  plot_data = (fluid == 'Water') ? TS_Water_data : TS_R134a_data;

  const sat_dome_trace = {
    x: plot_data.S_sat_dome,
    y: plot_data.T_sat_dome,
    name: 'saturation dome',
    type: 'scatter',
    hoverinfo: 'skip'
  }

  const V_trace = {
    x: plot_data.S,
    y: plot_data.T,
    z: plot_data.V,
    type: 'contour',
    name: 'V (m^3/kg)',
    showscale: false,
    hoverongaps: false,
    autocontour: false,
    contours: {
      start: .001,
      coloring: 'none',
      showlabels: true,
    },
    line: {
      dash: "longdash"
    },
    hovertemplate: 'V: %{z:.2e} m^3/kg<extra></extra>',
  }

  const D_trace = {
    x: plot_data.S,
    y: plot_data.T,
    z: plot_data.D,
    type: 'contour',
    name: 'D (kg/m^3)',
    showscale: false,
    hoverongaps: false,
    contours: {
      coloring: 'none',
      showlabels: true,
    },
    line: {
      dash: "dashdot"
    },
    hovertemplate: 'D: %{z:.2e} kg/m^3<extra></extra>',
  }
  const H_trace = {
    x: plot_data.S,
    y: plot_data.T,
    z: plot_data.H,
    type: 'contour',
    name: 'H (J/(kg*K))',
    showscale: false,
    hoverongaps: false,
    contours: {
      start: 5e5,
      size: 5e5,
      end: 1e7,
      coloring: 'none',
      showlabels: true,
    },
    line: {
      dash: "dot"
    },
    hovertemplate: 'H: %{z:.2e} J/(kg*K)<extra></extra>',
  }
  const Q_trace = {
    x: plot_data.S,
    y: plot_data.T,
    z: plot_data.Q,
    type: 'contour',
    name: 'Q (-)',
    autocontour: true,
    contours: {
      start: 0,
      size: .1,
      end: 1,
      coloring: "none",
      labelformat: ".1f",
      showlabels: true,
    },

    line: {
      smoothing: 1,
      dash: "dash",
    },

    zmax: 1,
    zmin: 0,

    showscale: false,
    hoverongaps: false,
    hovertemplate: 'Q: %{z:.2f}<extra></extra>',
  }
  const P_trace = {
    x: plot_data.S,
    y: plot_data.T,
    z: plot_data.P,
    type: 'contour',
    name: 'P (Pa)',
    showscale: false,
    hoverongaps: false,
    contours: {
      start: 1e12,
      size: 1e12,
      end: 5e12,
      coloring: 'none',
      showlabels: true,
    },
    line: {
      dash: "solid"
    },
    hovertemplate: 'S: %{x:d} J/kg/K<br>T: %{y:d} K<br>P: %{z:.3e} Pa<extra></extra>',
  }

  const state_trace = {
    x: [],
    y: [],
    name: 'state',
    type: 'scatter',
    mode: 'markers',
    hoverinfo: 'skip',
    marker: {
      size: 12,
    }
  };

  const data = [sat_dome_trace, V_trace, H_trace, Q_trace, P_trace, state_trace]

  const layout = {
    title: `${fluid} T-S diagram`,
    showlegend: true,
    legend: {
      orientation: 'h',
      x: .5,
      xanchor: 'center',
      y: 1.05,
    },
    hovermode: 'x',
    xaxis: {
      title: 'S (J/kg/K)',
      text: 'S (J/kg/K)'
    },
    yaxis: {
      title: 'T (K)',
      text: 'T (K)',
    }
  }

  Plotly.newPlot('plot_window', data, layout, { responsive: true });
}

function property_plot() {
  plot_type = elements.plot_type.value;
  if (plot_type == 'PH') {
    PH_plot();
  }
  if (plot_type == 'TS') {
    TS_plot();
  }
}

function plot_state() {

  plot_type = elements.plot_type.value;
  data = elements.plot_window.data;

  switch (plot_type) {
    case 'PH':
      x = state.H;
      y = state.P;
      break;
    case 'TS':
      x = state.S;
      y = state.T;
  }

  const state_trace_update = {
    x: [[x]],
    y: [[y]],
  }


  Plotly.restyle('plot_window', state_trace_update, data.length - 1)

}

  
initialize();