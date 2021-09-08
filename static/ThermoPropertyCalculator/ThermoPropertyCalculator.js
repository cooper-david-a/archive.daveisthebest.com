convertToSI = {
  'K':(x)=>x,
  '°C':(x)=>x+273.15,
  'Pa':(x)=>x,
  'kPa':(x)=>x*1000,
  'MPa':(x)=>x*1e6,
  'kg/m^3':(x)=>x,
  'J/kg':(x)=>x,
  'kJ/kg':(x)=>x*1000,
  'J/(kg*K)':(x)=>x,
  'kJ/(kg*K)':(x)=>x*1000
}

convertFromSI = {
  'K':(x)=>x,
  '°C':(x)=>x-273.15,
  'Pa':(x)=>x,
  'kPa':(x)=>x/1000,
  'MPa':(x)=>x/1e6,
  'kg/m^3':(x)=>x,
  'J/kg':(x)=>x,
  'kJ/kg':(x)=>x/1000,
  'J/(kg*K)':(x)=>x,
  'kJ/(kg*K)':(x)=>x/1000
}

const variables = {
  'T':{units:['K','°C'], calc: (in1,in2,fluid)=>Module.PropsSI('T',in1.variable,in1.value,in2.variable,in2.value,fluid)},
  'P':{units:['Pa','kPa','MPa'], calc: (in1,in2,fluid)=>Module.PropsSI('P',in1.variable,in1.value,in2.variable,in2.value,fluid)},
  'D':{units:['kg/m^3'], calc: (in1,in2,fluid)=>Module.PropsSI('D',in1.variable,in1.value,in2.variable,in2.value,fluid)},
  'U':{units:['J/kg','kJ/kg'], calc: (in1,in2,fluid)=>Module.PropsSI('U',in1.variable,in1.value,in2.variable,in2.value,fluid)},
  'H':{units:['J/kg','kJ/kg'], calc: (in1,in2,fluid)=>Module.PropsSI('H',in1.variable,in1.value,in2.variable,in2.value,fluid)},
  'S':{units:['J/(kg*K)','kJ/(kg*K)'], calc: (in1,in2,fluid)=>Module.PropsSI('S',in1.variable,in1.value,in2.variable,in2.value,fluid)}
  };

const elements = {
  fluid: document.getElementById('fluid'),
  in1Var: document.getElementById('in1Var'),
  in1Value: document.getElementById('in1Value'),
  in1Units: document.getElementById('in1Units'),
  in2Var: document.getElementById('in2Var'),
  in2Value: document.getElementById('in2Value'),
  in2Units: document.getElementById('in2Units'),

  outTValue: document.getElementById('outTValue'),
  outPValue: document.getElementById('outPValue'),
  outDValue: document.getElementById('outDValue'),
  outUValue: document.getElementById('outUValue'),
  outHValue: document.getElementById('outHValue'),
  outSValue: document.getElementById('outSValue'),
  
  outTUnits: document.getElementById('outTUnits'),
  outPUnits: document.getElementById('outPUnits'),
  outDUnits: document.getElementById('outDUnits'),
  outUUnits: document.getElementById('outUUnits'),
  outHUnits: document.getElementById('outHUnits'),
  outSUnits: document.getElementById('outSUnits')
}

function getInput(n) {
  input = {
    variable: elements[`in${n}Var`].value,
    value: parseFloat(elements[`in${n}Value`].value),
    units: elements[`in${n}Units`].value
  }
  input.value = convertToSI[input.units](input.value);
  return input;
}

function updateSecondInputVariables() {
  deleteAllOptions(elements.in2Var);
  addOptions(elements.in2Var, Object.keys(variables));
  elements.in2Var.remove(elements.in1Var.selectedIndex);
}

function updateInputUnits() {
  deleteAllOptions(elements.in1Units);
  deleteAllOptions(elements.in2Units);
  addOptions(elements.in1Units,variables[elements.in1Var.value].units);
  addOptions(elements.in2Units,variables[elements.in2Var.value].units);
}

function updateOutputUnits() {
  for (variable of Object.keys(variables)){
    addOptions(elements[`out${variable}Units`],variables[variable].units);
  }
}

function deleteAllOptions(selectElement){
  for (i = selectElement.length - 1; i >= 0; i--) {
    selectElement.remove(i);
  }
}

function addOptions(selectElement, options){
  for (option of options){
    let opt = document.createElement('option');
    opt.value = option;
    opt.innerText = option;
    selectElement.options.add(opt);
  }
}



function calculate() {
  let fluid = elements.fluid.value;
  const in1 = getInput(1);
  const in2 = getInput(2);
  let state = {};

  for (variable of Object.keys(variables)){
    state[variable] = variables[variable].calc(in1,in2,fluid);
  }
  
  for (variable of Object.keys(variables)){
    elements[`out${variable}Value`].innerText = convertFromSI[elements[`out${variable}Units`].value](state[variable]).toPrecision(4);
  }
}

function initialize(){
  updateInputUnits();
  updateOutputUnits();
}