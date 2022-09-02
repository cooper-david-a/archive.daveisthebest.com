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

  elements.outPhase.innerText = getPhase();

};


function initialize() {
  updateSecondInputVariables();
  updateInputUnits();
  updateOutputUnits();
};