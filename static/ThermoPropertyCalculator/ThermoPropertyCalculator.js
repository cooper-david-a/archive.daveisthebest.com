var phaseIndexLiquid;
var phaseIndexMixed;
var phaseIndexVapor;
var phaseIndexSupCrit;

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
  let state = {};

  for (variable of Object.keys(variables)) {
    state[variable] = variables[variable].calc(in1, in2, fluid);
  };

  
  for (variable of Object.keys(variables)) {
    elements[`out${variable}Value`].innerText = convertFromSI[elements[`out${variable}Units`].value](state[variable]).toPrecision(4);
  };
  
  elements.outQValue.innerText = ((state.Q <= 1) & (state.Q >= 0)) ? elements.outQValue.innerText : "N/A";
  
  elements.outPhase.innerText = getPhase();
  Plotly.addTraces(
    'PH_plot',
    {
      x: [state.H],
      y: [state.P],
      type: 'scatter',
      mode: 'markers',
      marker:{size:20}
    });
};


function initialize() {
  updateSecondInputVariables();
  updateInputUnits();
  updateOutputUnits();
};


const sat_dome_trace = {
  x: PH_plot_data.H_sat_dome,
  y: PH_plot_data.P_sat_dome,
  name: 'saturation dome',
  type: 'scatter',
  hoverinfo: 'skip'
}

const V_trace = {
  x: PH_plot_data.H,
  y: PH_plot_data.P,
  z: PH_plot_data.V,
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
  x: PH_plot_data.H,
  y: PH_plot_data.P,
  z: PH_plot_data.D,
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
  hovertemplate: 'D: %{z:3.2g} (kg/m^3)<extra></extra>',
}
const S_trace = {
  x: PH_plot_data.H,
  y: PH_plot_data.P,
  z: PH_plot_data.S,
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
  x: PH_plot_data.H,
  y: PH_plot_data.P,
  z: PH_plot_data.Q,
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
  hovertemplate: 'Q: %{z:0.2f}<extra></extra>',
}
const T_trace = {
  x: PH_plot_data.H,
  y: PH_plot_data.P,
  z: PH_plot_data.T,
  type: 'contour',
  name: 'T (K)',
  showscale: false,
  hoverongaps: false,
  contours: {
    start: 300,
    size: 50,
    end: 1000,
    coloring: 'none',
    showlabels: true,
  },
  line: {
    dash: "solid"
  },
  hovertemplate: 'H: %{x:1.2e} J/kg<br>P: %{y:1.2e} Pa<br>T: %{z:1.0d}K<extra></extra>',
}

const data = [sat_dome_trace, D_trace, S_trace, Q_trace, T_trace]

const layout = {
  title: "Water P-H diagram",
  showlegend: true,
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

Plotly.newPlot('PH_plot', data, layout, {responsive: true});

initialize()