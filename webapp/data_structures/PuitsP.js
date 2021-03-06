function PuitsP() {

    PuitsP.prototype.define = function PuitsP() {
        this.P0 = 100000;
        this.T0 = 290;
        this.H0 = 100000;
        this.option_temperature = 1;

        var model = scicos_model();
        model.rpar = new ScilabDouble([this.P0], [this.T0], [this.H0], [this.option_temperature]);
        model.sim = new ScilabString(["Puits"]);
        model.blocktype = new ScilabString(["c"]);
        model.dep_ut = new ScilabBoolean([true, false]);

        var mo = new modelica_function();
        mo.model = new ScilabString(["Puits"]);
        mo.inputs = new ScilabString(["C"]);
        mo.outputs = new ScilabDouble();
        mo.parameters = list(new ScilabString(["P0"], ["T0"], ["H0"], ["option_temperature"]), new ScilabDouble([this.P0], [this.T0], [this.H0], [this.option_temperature]));
        model.equations = mo;
        model.in = new ScilabDouble(...ones(size(getData(mo.inputs), "*"), 1));

        var exprs = new ScilabString([this.P0], [this.T0], [this.H0], [this.option_temperature]);

        var gr_i = new ScilabString(["xstringb(orig(1),orig(2),\"PuitsP\",sz(1),sz(2));"]);
        this.x = standard_define([2.5, 2], model, exprs, list(gr_i, new ScilabDouble(0)));
        this.x.graphics.in_implicit = new ScilabString(["I"]);
        return new BasicBlock(this.x);
    }
    PuitsP.prototype.details = function PuitsP() {
        return this.x;
    }
PuitsP.prototype.get = function PuitsP() {
        var options={
            P0:["Pression de la source : P0 (Pa)",this.P0.toString().replace(/,/g," ")],
            T0:["Temperature de la source : T0 (K)",this.T0.toString().replace(/,/g," ")],
            H0:["Enthalpie spécifique de la source : H0 (J/kg)",this.H0.toString().replace(/,/g," ")],
            option_temperature:["1:température fixée - 2:enthalpie fixée : option_temperature",this.option_temperature.toString().replace(/,/g," ")],
        }
        return options
    }
PuitsP.prototype.set = function PuitsP() {
    this.P0 = inverse(arguments[0]["P0"])
    this.T0 = inverse(arguments[0]["T0"])
    this.H0 = inverse(arguments[0]["H0"])
    this.option_temperature = inverse(arguments[0]["option_temperature"])
    this.x.model.rpar = new ScilabDouble(...this.P0,...this.T0,...this.H0,...this.option_temperature)
    this.x.model.equations.parameters = list(new ScilabString(["P0"], ["T0"], ["H0"], ["option_temperature"]), list(new ScilabDouble([this.P0]),new ScilabDouble([this.T0]),new ScilabDouble([this.H0]),new ScilabDouble([this.option_temperature])));
    var exprs = new ScilabString([this.P0.toString().replace(/,/g, " ")],[this.T0.toString().replace(/,/g, " ")],[this.H0.toString().replace(/,/g, " ")],[this.option_temperature.toString().replace(/,/g, " ")])
    this.x.graphics.exprs=exprs
    return new BasicBlock(this.x)
    }

   PuitsP.prototype.get_popup_title = function PuitsP() {
        var set_param_popup_title="Set parameters";
        return set_param_popup_title
    }
    PuitsP.prototype.getDimensionForDisplay = function PuitsP(){
        var dimension = { width: 50, height: 40 };
        return dimension
    }
}
