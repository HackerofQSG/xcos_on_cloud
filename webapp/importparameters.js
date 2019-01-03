/*
 * This function is used to extract the values of the properties of a block
 * from the XML. The values are either present under the "exprs" node or are
 * scattered over different nodes.
 */
function importBlock(currentNode, cell, details_instance) {
    details_instance.define();
    var model = details_instance.x.model;
    var graphics = details_instance.x.graphics;

    var dependsOnU = (cell.dependsOnU !== undefined && cell.dependsOnU == 1);
    var dependsOnT = (cell.dependsOnT !== undefined && cell.dependsOnT == 1);
    model.dep_ut = new ScilabBoolean([dependsOnU, dependsOnT]);
    var functionName = null;
    if (cell.simulationFunctionName) {
        functionName = cell.simulationFunctionName;
    }
    var functionType = null;
    switch (cell.simulationFunctionType) {
        case 'ESELECT':                functionType =    -2.0;  break;
        case 'IFTHENELSE':             functionType =    -1.0;  break;
        case 'TYPE_1':                 functionType =     1.0;  break;
        case 'TYPE_2':                 functionType =     2.0;  break;
        case 'TYPE_3':                 functionType =     3.0;  break;
        case 'C_OR_FORTRAN':           functionType =     4.0;  break;
        case 'SCILAB':                 functionType =     5.0;  break;
        case 'DEBUG':                  functionType =    99.0;  break;
        case 'DYNAMIC_FORTRAN_1':      functionType =  1001.0;  break;
        case 'DYNAMIC_C_1':            functionType =  2001.0;  break;
        case 'DYNAMIC_EXPLICIT_4':     functionType =  2004.0;  break;
        case 'OLDBLOCKS':              functionType = 10001.0;  break;
        case 'IMPLICIT_C_OR_FORTRAN':  functionType = 10004.0;  break;
        case 'MODELICA':               functionType = 30004.0;  break;
    }
    if (functionName != null) {
        if (functionType != null) {
            model.sim = list(new ScilabString([functionName]), new ScilabDouble([functionType]));
        } else {
            model.sim = new ScilabString([functionName]);
        }
    }
    if (cell.exprs) {
        graphics.exprs = cell.exprs;
    }
    if (cell.realParameters !== undefined) {
        model.rpar = getMListObject(cell.realParameters);
    }
    if (cell.integerParameters !== undefined) {
        model.ipar = cell.integerParameters;
    }
    if (cell.objectsParameters !== undefined) {
        model.opar = cell.objectsParameters;
    }
    if (cell.nbZerosCrossing !== undefined) {
        model.nzcross = cell.nbZerosCrossing;
    }
    if (cell.nmode !== undefined) {
        model.nmode = cell.nmode;
    }
    if (cell.state !== undefined) {
        model.state = cell.state;
    }
    if (cell.dState !== undefined) {
        model.dstate = cell.dState;
    }
    if (cell.oDState !== undefined) {
        model.odstate = cell.oDState;
    }
    if (cell.equations !== undefined) {
        model.equations = getMListObject(cell.equations);
    }

    if (typeof details_instance.importset === 'function') {
        /* set the remaining parameters */
        details_instance.importset();
    }

    return details_instance.getContainer();
}

function getMListObject(obj) {
    if (obj.scilabClass == null || !(['ScilabMList', 'ScilabTList'].includes(obj.scilabClass)))
        return obj;

    var newObj = new Object();
    var keys = getData(obj[0]);
    for (var [i, key] of keys.entries()) {
        var objlist = obj[i];
        if (objlist.scilabClass == 'ScilabList') {
            var newObjList = Array();
            for (var [j, o] of objlist.entries()) {
                var tmpobj = getMListObject(o);
                newObjList[j] = tmpobj;
            }
            newObjList.scilabClass = objlist.scilabClass;
            newObj[key] = newObjList;
        } else {
            newObj[key] = getMListObject(objlist);
        }
    }
    newObj.scilabClass = obj.scilabClass;
    return newObj;
}

function getRparObjByGui(obj, gui) {
    var objs = obj.model.rpar.objs;
    if (objs == null)
        return null;
    for (var [i, o] of objs.entries()) {
        var ary = getData(o.gui);
        if (ary[0] == gui) {
            return o;
        }
    }
}

function getDataPoints(par, withrect=false) {
    var no = Math.trunc(par.length / 2);
    if (withrect)
        no -= 2;
    var defaultpoints = [];
    var xmin = Number.MAX_VALUE;
    var xmax = -Number.MAX_VALUE;
    var ymin = Number.MAX_VALUE;
    var ymax = -Number.MAX_VALUE;
    if (no == 0) {
        xmin = 0;
        xmax = 0;
        ymin = 0;
        ymax = 0;
    }
    for (var i = 0; i < no; i++) {
        var x = parseFloat(par[i]);
        var y = parseFloat(par[no+i]);
        defaultpoints.push([x, y])
        if (xmin > x)
            xmin = x;
        if (xmax < x)
            xmax = x;
        if (ymin > y)
            ymin = y;
        if (ymax < y)
            ymax = y;
    }
    if (withrect) {
        xmin = parseFloat(par[2*no]);
        xmax = parseFloat(par[2*no+2]);
        ymin = parseFloat(par[2*no+1]);
        ymax = parseFloat(par[2*no+3]);
    } else {
        var xgap = (xmax - xmin) / 20;
        if (xgap == 0)
            xgap = 0.5;
        var ygap = (ymax - ymin) / 20;
        if (ygap == 0)
            ygap = 0.5;
        xmin -= xgap;
        xmax += xgap;
        ymin -= ygap;
        ymax += ygap;
    }
    xmin = xmin.toPrecision(2);
    xmax = xmax.toPrecision(2);
    ymin = ymin.toPrecision(2);
    ymax = ymax.toPrecision(2);
    return { defaultpoints, xmin, xmax, ymin, ymax };
}

ABS_VALUE.prototype.importset = function ABS_VALUE() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.zcr = ary[0];
}
AFFICH_m.prototype.importset = function AFFICH_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.in = ary[0];
    this.font = ary[1];
    this.fontsize = ary[2];
    this.colr = ary[3];
    this.nt = ary[4];
    this.nd = ary[5];
    this.herit = ary[6];
}
AUTOMAT.prototype.importset = function AUTOMAT() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.NMode = ary[0];
    this.Minitial = ary[1];
    this.NX = ary[2];
    this.X0 = ary[3];
    this.XP = ary[4];
    this.C1 = ary[5];
    this.C2 = ary[6];
}
Bache.prototype.importset = function Bache() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Patm = ary[0];
    this.A = ary[1];
    this.ze1 = ary[2];
    this.ze2 = ary[3];
    this.zs1 = ary[4];
    this.zs2 = ary[5];
    this.z0 = ary[6];
    this.T0 = ary[7];
    this.p_rho = ary[8];
}
BACKLASH.prototype.importset = function BACKLASH() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.ini = ary[0];
    this.gap = ary[1];
    this.zcr = ary[2];
}
BARXY.prototype.importset = function BARXY() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.xmin = ary[0];
    this.xmax = ary[1];
    this.ymin = ary[2];
    this.ymax = ary[3];
    this.thickness = ary[4];
}
BIGSOM_f.prototype.importset = function BIGSOM_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.sgn = ary[0];
}
BITCLEAR.prototype.importset = function BITCLEAR() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Datatype = ary[0];
    this.bit = ary[1];
    this.displayParameter = [this.bit];
}
BITSET.prototype.importset = function BITSET() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Datatype = ary[0];
    this.bit = ary[1];
    this.displayParameter = [this.bit];
}
BOUNCE.prototype.importset = function BOUNCE() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.rpar1 = ary[0];
    this.rpar2 = ary[1];
    this.walls = ary[2];
    this.xt = ary[3];
    this.xd = ary[4];
    this.y = ary[5];
    this.yd = ary[6];
    if (ary.length >= 9) {
        this.g = ary[7];
        this.C = ary[8];
    }
}
BOUNCEXY.prototype.importset = function BOUNCEXY() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.clrs = ary[0];
    this.siz = ary[1];
    this.win = ary[2];
    this.imode = ary[3];
    this.xmin = ary[4];
    this.xmax = ary[5];
    this.ymin = ary[6];
    this.ymax = ary[7];
}
BPLATFORM.prototype.importset = function BPLATFORM() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.plen = ary[0];
    this.csiz = ary[1];
    this.phi = ary[2];
    this.xmin = ary[3];
    this.xmax = ary[4];
    this.ymin = ary[5];
    this.ymax = ary[6];
}
CANIMXY3D.prototype.importset = function CANIMXY3D() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nbr_curves = ary[0];
    this.clrs = ary[1];
    this.siz = ary[2];
    this.win = ary[3];
    this.wpos = ary[4];
    this.wdim = ary[5];
    this.vec_x = ary[6];
    this.vec_y = ary[7];
    this.vec_z = ary[8];
    this.param3ds = ary[9];
    this.N = ary[10];
}
CANIMXY.prototype.importset = function CANIMXY() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nbr_curves = ary[0];
    this.clrs = ary[1];
    this.siz = ary[2];
    this.win = ary[3];
    this.wpos = ary[4];
    this.wdim = ary[5];
    this.xmin = ary[6];
    this.xmax = ary[7];
    this.ymin = ary[8];
    this.ymax = ary[9];
    this.N = ary[10];
}
Capacitor.prototype.importset = function Capacitor() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.C = ary[0];
    this.v = ary[1];
}
CBLOCK4.prototype.importset = function CBLOCK4() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.function_name = ary[0];
    this.impli = ary[1];
    this.in = ary[2];
    this.it = ary[3];
    this.out = ary[4];
    this.ot = ary[5];
    this.ci = ary[6];
    this.co = ary[7];
    this.xx = ary[8];
    this.z = ary[9];
    this.oz = ary[10];
    this.rpar = ary[11];
    this.ipar = ary[12];
    this.opar = ary[13];
    this.nmode = ary[14];
    this.nzcr = ary[15];
    this.auto0 = ary[16];
    this.depu = ary[17];
    this.dept = ary[18];
    var funam = this.function_name;
    this.displayParameter = [funam];
}
c_block.prototype.importset = function c_block() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.i = ary[0];
    this.o = ary[1];
    this.rpar = ary[2];
    this.funam = ary[3];
    this.displayParameter = [this.funam];
}
CBLOCK.prototype.importset = function CBLOCK() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.function_name = ary[0];
    this.impli = ary[1];
    this.i = ary[2];
    this.o = ary[3];
    this.ci = ary[4];
    this.co = ary[5];
    this.xx = ary[6];
    this.ng = ary[7];
    this.z = ary[8];
    this.rpar = ary[9];
    this.ipar = ary[10];
    this.auto0 = ary[11];
    this.depu = ary[12];
    this.dept = ary[13];
    var funam = this.function_name;
    this.displayParameter = [funam];
}
CEVENTSCOPE.prototype.importset = function CEVENTSCOPE() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nclock = ary[0];
    this.clrs = ary[1];
    this.win = ary[2];
    this.wpos = ary[3];
    this.wdim = ary[4];
    this.per = ary[5];
}
CFSCOPE.prototype.importset = function CFSCOPE() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.clrs = ary[0];
    this.win = ary[1];
    this.wpos = ary[2];
    this.wdim = ary[3];
    this.ymin = ary[4];
    this.ymax = ary[5];
    this.per = ary[6];
    this.N = ary[7];
    this.wu = ary[8];
}
CLKFROM.prototype.importset = function CLKFROM() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tag = ary[0];
    this.displayParameter = [this.tag];
}
CLKGOTO.prototype.importset = function CLKGOTO() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tag = ary[0];
    this.tagvis = ary[1];
    this.displayParameter = [this.tag];
}
CLKGotoTagVisibility.prototype.importset = function CLKGotoTagVisibility() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tag = ary[0];
    this.displayParameter = [this.tag];
}
CLKINV_f.prototype.importset = function CLKINV_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.prt = ary[0];
    this.displayParameter = [this.prt];
}
CLKOUTV_f.prototype.importset = function CLKOUTV_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.prt = ary[0];
    this.displayParameter = [this.prt];
}
CLOCK_c.prototype.importset = function CLOCK_c() {
    var block = getRparObjByGui(this.x, 'EVTDLY_c');
    if (block == null)
        return;
    var graphics = block.graphics;
    var ary = getData(graphics.exprs);
    this.dt = ary[0];
    this.t0 = ary[1];
}
CLR.prototype.importset = function CLR() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.num = ary[0];
    this.den = ary[1];
    this.displayParameter = [[this.num], [this.den]];
}
CLSS.prototype.importset = function CLSS() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.A = ary[0];
    this.B = ary[1];
    this.C = ary[2];
    this.D = ary[3];
    this.x0 = ary[4];
}
CMAT3D.prototype.importset = function CMAT3D() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.vec_x = ary[0];
    this.vec_y = ary[1];
    this.colormap = ary[2];
    this.cmin = ary[3];
    this.cmax = ary[4];
    this.size_c = this.colormap.replace(/.*\((.*)\).*/, "$1");
}
CMATVIEW.prototype.importset = function CMATVIEW() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.colormap = ary[0];
    this.cmin = ary[1];
    this.cmax = ary[2];
    this.size_c = this.colormap.replace(/.*\((.*)\).*/, "$1");
}
CMSCOPE.prototype.importset = function CMSCOPE() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.in = ary[0];
    this.clrs = ary[1];
    this.win = ary[2];
    this.wpos = ary[3];
    this.wdim = ary[4];
    this.ymin = ary[5];
    this.ymax = ary[6];
    this.per = ary[7];
    this.N = ary[8];
    this.heritance = ary[9];
    this.nom = ary[10];
}
ConstantVoltage.prototype.importset = function ConstantVoltage() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.V = ary[0];
}
CONST_f.prototype.importset = function CONST_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.C = ary[0];
    this.displayParameter = [this.C];
}
CONST.prototype.importset = function CONST() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.C = ary[0];
    this.displayParameter = [this.C];
}
CONST_m.prototype.importset = function CONST_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.C = ary[0];
    this.displayParameter = [this.C];
}
CONSTRAINT2_c.prototype.importset = function CONSTRAINT2_c() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.x0 = ary[0];
    this.xd0 = ary[1];
    this.id = ary[2];
    this.displayParameter = [[this.x0], [this.xd0]];
}
CONSTRAINT_c.prototype.importset = function CONSTRAINT_c() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.x0 = ary[0];
    this.displayParameter = [this.x0];
}
CONVERT.prototype.importset = function CONVERT() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.it = ary[0];
    this.ot = ary[1];
    this.np = ary[2];
}
Counter.prototype.importset = function Counter() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.minim = ary[0];
    this.maxim = ary[1];
    this.rule = ary[2];
    this.displayParameter = [[this.minim], [this.maxim]];
}
CSCOPE.prototype.importset = function CSCOPE() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.clrs = ary[0];
    this.win = ary[1];
    this.wpos = ary[2];
    this.wdim = ary[3];
    this.ymin = ary[4];
    this.ymax = ary[5];
    this.per = ary[6];
    this.N = ary[7];
    this.heritance = ary[8];
    this.nom = ary[9];
}
CSCOPXY3D.prototype.importset = function CSCOPXY3D() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nbr_curves = ary[0];
    this.clrs = ary[1];
    this.siz = ary[2];
    this.win = ary[3];
    this.wpos = ary[4];
    this.wdim = ary[5];
    this.vec_x = ary[6];
    this.vec_y = ary[7];
    this.vec_z = ary[8];
    this.param3ds = ary[9];
    this.N = ary[10];
}
CSCOPXY.prototype.importset = function CSCOPXY() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nbr_curves = ary[0];
    this.clrs = ary[1];
    this.siz = ary[2];
    this.win = ary[3];
    this.wpos = ary[4];
    this.wdim = ary[5];
    this.xmin = ary[6];
    this.xmax = ary[7];
    this.ymin = ary[8];
    this.ymax = ary[9];
    this.N = ary[10];
}
CUMSUM.prototype.importset = function CUMSUM() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.decomptyp = ary[1];
}
CURV_f.prototype.importset = function CURV_f() {
    var model = this.x.model;
    var par = getData(model.rpar);
    var { defaultpoints, xmin, xmax, ymin, ymax } = getDataPoints(par, true);
    this.defaultpoints = defaultpoints;
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;
}
DEADBAND.prototype.importset = function DEADBAND() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.maxp = ary[0];
    this.minp = ary[1];
    this.zeroc = ary[2];
}
DEBUG.prototype.importset = function DEBUG() {
    /* TODO */
}
DELAY_f.prototype.importset = function DELAY_f() {
    var block = getRparObjByGui(this.x, 'EVTDLY_f');
    if (block == null)
        return;
    var graphics = block.graphics;
    var ary = getData(graphics.exprs);
    this.dt = ary[0];

    block = getRparObjByGui(this.x, 'REGISTER_f');
    if (block == null)
        return;
    graphics = block.graphics;
    ary = getData(graphics.exprs);
    this.zz0 = ary[0];
}
DELAYV_f.prototype.importset = function DELAYV_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nin = ary[0];
    this.zz0 = ary[1];
    this.T = ary[2];
}
DEMUX_f.prototype.importset = function DEMUX_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.out = ary[0];
}
DEMUX.prototype.importset = function DEMUX() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.out = ary[0];
}
DIFF_f.prototype.importset = function DIFF_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.x0 = ary[0];
    this.xd0 = ary[1];
}
Diode.prototype.importset = function Diode() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Ids = ary[0];
    this.Vt = ary[1];
    this.Maxexp = ary[2];
    this.R = ary[3];
}
DLRADAPT_f.prototype.importset = function DLRADAPT_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.p = ary[0];
    this.rn = ary[1];
    this.rd = ary[2];
    this.g = ary[3];
    this.last_u = ary[4];
    this.last_y = ary[5];
}
DLR.prototype.importset = function DLR() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.num = ary[0];
    this.den = ary[1];
    this.displayParameter = [[this.num], [this.den]];
}
DLSS.prototype.importset = function DLSS() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.A = ary[0];
    this.B = ary[1];
    this.C = ary[2];
    this.D = ary[3];
    this.x0 = ary[4];
}
DOLLAR_f.prototype.importset = function DOLLAR_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.a = ary[0];
    this.inh = ary[1];
}
DOLLAR.prototype.importset = function DOLLAR() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.a = ary[0];
    this.inh = ary[1];
}
DOLLAR_m.prototype.importset = function DOLLAR_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.a = ary[0];
    this.inh = ary[1];
}
EDGE_TRIGGER.prototype.importset = function EDGE_TRIGGER() {
    var block = getRparObjByGui(this.x, 'EDGETRIGGER');
    if (block == null)
        return;
    var graphics = block.graphics;
    var ary = getData(graphics.exprs);
    this.edge = ary[0];
}
EDGETRIGGER.prototype.importset = function EDGETRIGGER() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.edge = ary[0];
}
ENDBLK.prototype.importset = function ENDBLK() {
    var block = getRparObjByGui(this.x, 'END_c');
    if (block == null)
        return;
    var graphics = block.graphics;
    var ary = getData(graphics.exprs);
    this.simulationtime = ary[0];
}
END_c.prototype.importset = function END_c() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tf = ary[0];
}
ESELECT_f.prototype.importset = function ESELECT_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.out = ary[0];
    this.inh = ary[1];
    this.nmod = ary[2];
}
EVTDLY_c.prototype.importset = function EVTDLY_c() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.dt = ary[0];
    this.ff = ary[1];
    this.displayParameter = [this.dt];
}
EVTDLY_f.prototype.importset = function EVTDLY_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.dt = ary[0];
    this.ff = ary[1];
}
EVTGEN_f.prototype.importset = function EVTGEN_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tt = ary[0];
    this.displayParameter = [this.tt];
}
EVTVARDLY.prototype.importset = function EVTVARDLY() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.fir = ary[0];
}
EXPBLK_m.prototype.importset = function EXPBLK_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.a = ary[0];
}
// EXPRESSION.prototype.importset = function EXPRESSION() {
//    /* TODO */
// }
EXTRACTBITS.prototype.importset = function EXTRACTBITS() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Datatype = ary[0];
    this.rule = ary[1];
    this.bit = ary[2];
    this.scal = ary[3];
    this.displayParameter = [this.rule];
}
EXTRACT.prototype.importset = function EXTRACT() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.a = ary[1];
    this.b = ary[2];
}
EXTRACTOR.prototype.importset = function EXTRACTOR() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.ind = ary[0];
}
EXTTRI.prototype.importset = function EXTTRI() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.decomptyp = ary[1];
}
Flowmeter.prototype.importset = function Flowmeter() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Qini = ary[0];
}
fortran_block.prototype.importset = function fortran_block() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.i = ary[0];
    this.o = ary[1];
    this.rpar = ary[2];
    this.funam = ary[3];
    this.displayParameter = [this.funam];
}
freq_div.prototype.importset = function freq_div() {
    var block = getRparObjByGui(this.x, 'Modulo_Count');
    if (block == null)
        return;
    var graphics = block.graphics;
    var ary = getData(graphics.exprs);
    this.phase = ary[0];
    this.divfac = ary[1];
}
FROM.prototype.importset = function FROM() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tag = ary[0];
    this.displayParameter = [this.tag];
}
FROMMO.prototype.importset = function FROMMO() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tag = ary[0];
    this.displayParameter = [this.tag];
}
FROMWSB.prototype.importset = function FROMWSB() {
    var block = getRparObjByGui(this.x, 'FROMWS_c');
    if (block == null)
        return;
    /* TODO */
}
GAINBLK_f.prototype.importset = function GAINBLK_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.gain = ary[0];
    this.displayParameter = [this.gain];
}
GAINBLK.prototype.importset = function GAINBLK() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.gain = ary[0];
    this.over = ary[1];
    this.displayParameter = [this.gain];
}
GAIN_f.prototype.importset = function GAIN_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.gain = ary[0];
    this.displayParameter = [this.gain];
}
GENERAL_f.prototype.importset = function GENERAL_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.in = ary[0];
    this.out = ary[1];
}
generic_block3.prototype.importset = function generic_block3() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.function_name = ary[0];
    this.funtyp = ary[1];
    this.in = ary[2];
    this.it = ary[3];
    this.out = ary[4];
    this.ot = ary[5];
    this.ci = ary[6];
    this.co = ary[7];
    this.xx = ary[8];
    this.z = ary[9];
    this.oz = ary[10];
    this.rpar = ary[11];
    this.ipar = ary[12];
    this.opar = ary[13];
    this.nmode = ary[14];
    this.nzcr = ary[15];
    this.auto0 = ary[16];
    this.depu = ary[17];
    this.dept = ary[18];
    this.displayParameter = [this.function_name];
}
GENSIN_f.prototype.importset = function GENSIN_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.M = ary[0];
    this.F = ary[1];
    this.P = ary[2];
}
GENSQR_f.prototype.importset = function GENSQR_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Amplitude = ary[0];
}
GOTO.prototype.importset = function GOTO() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tag = ary[0];
    this.tagvis = ary[1];
    this.displayParameter = [this.tag];
}
GOTOMO.prototype.importset = function GOTOMO() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tag = ary[0];
    this.tagvis = ary[1];
    this.displayParameter = [this.tag];
}
GotoTagVisibility.prototype.importset = function GotoTagVisibility() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tag = ary[0];
    this.displayParameter = [this.tag];
}
GotoTagVisibilityMO.prototype.importset = function GotoTagVisibilityMO() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tag = ary[0];
    this.displayParameter = [this.tag];
}
Gyrator.prototype.importset = function Gyrator() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.G1 = ary[0];
    this.G2 = ary[1];
}
HALT_f.prototype.importset = function HALT_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.n = ary[0];
}
HYSTHERESIS.prototype.importset = function HYSTHERESIS() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.high_lim = ary[0];
    this.low_lim = ary[1];
    this.out_high = ary[2];
    this.out_low = ary[3];
    this.nzz = ary[4];
}
IdealTransformer.prototype.importset = function IdealTransformer() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.N = ary[0];
}
IFTHEL_f.prototype.importset = function IFTHEL_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.inh = ary[0];
    this.nmod = ary[1];
}
Inductor.prototype.importset = function Inductor() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.L = ary[0];
}
IN_f.prototype.importset = function IN_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.prt = ary[0];
    this.otsz = ary[1];
    this.ot = ary[2];
    this.displayParameter = [this.prt];
}
INIMPL_f.prototype.importset = function INIMPL_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.prt = ary[0];
    this.displayParameter = [this.prt];
}
INTEGRAL_f.prototype.importset = function INTEGRAL_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.x0 = ary[0];
}
INTEGRAL_m.prototype.importset = function INTEGRAL_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.x0 = ary[0];
    this.reinit = ary[1];
    this.satur = ary[2];
    this.maxp = ary[3];
    this.lowp = ary[4];
}
INTMUL.prototype.importset = function INTMUL() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Datatype = ary[0];
    this.np = ary[1];
}
INTRP2BLK_f.prototype.importset = function INTRP2BLK_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.a = ary[0];
    this.b = ary[1];
    this.c = ary[2];
}
INTRPLBLK_f.prototype.importset = function INTRPLBLK_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.a = ary[0];
    this.b = ary[1];
}
ISELECT_m.prototype.importset = function ISELECT_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.nout = ary[1];
    this.z0 = ary[2];
}
JKFLIPFLOP.prototype.importset = function JKFLIPFLOP() {
    var block = getRparObjByGui(this.x, 'DOLLAR_m');
    if (block == null)
        return;
    var graphics = block.graphics;
    var ary = getData(graphics.exprs);
    this.initialvalue = ary[0];
}
LOGBLK_f.prototype.importset = function LOGBLK_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.a = ary[0];
}
LOGICAL_OP.prototype.importset = function LOGICAL_OP() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nin = ary[0];
    this.rule = ary[1];
    if (ary.length >= 4) {
        this.Datatype = ary[2];
        this.tp = ary[3];
    }
    var label = "";
    switch (this.rule) {
        case "0": label = "AND"; break;
        case "1": label = "OR"; break;
        case "2": label = "NAND"; break;
        case "3": label = "NOR"; break;
        case "4": label = "XOR"; break;
        case "5": label = "NOT"; break;
    }
    this.displayParameter = [label];
}
LOGIC.prototype.importset = function LOGIC() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.mat = ary[0];
    this.herit = ary[1];
}
LOOKUP_f.prototype.importset = function LOOKUP_f() {
    var model = this.x.model;
    var par = getData(model.rpar);
    var { defaultpoints, xmin, xmax, ymin, ymax } = getDataPoints(par);
    this.defaultpoints = defaultpoints;
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;
}
MATBKSL.prototype.importset = function MATBKSL() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
}
MATCATH.prototype.importset = function MATCATH() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nin = ary[0];
}
MATCATV.prototype.importset = function MATCATV() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nin = ary[0];
}
MATDET.prototype.importset = function MATDET() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
}
MATDIAG.prototype.importset = function MATDIAG() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
}
MATDIV.prototype.importset = function MATDIV() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
}
MATEIG.prototype.importset = function MATEIG() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.decomptyp = ary[1];
}
MATEXPM.prototype.importset = function MATEXPM() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
}
MATINV.prototype.importset = function MATINV() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
}
MATLU.prototype.importset = function MATLU() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
}
MATMAGPHI.prototype.importset = function MATMAGPHI() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.decomptyp = ary[0];
}
MATMUL.prototype.importset = function MATMUL() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.dtype = ary[0];
    this.rule = ary[1];
    this.np = ary[2];
}
MATPINV.prototype.importset = function MATPINV() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
}
MATRESH.prototype.importset = function MATRESH() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.l1 = ary[1];
    this.out = ary[2];
}
MATSING.prototype.importset = function MATSING() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.decomptyp = ary[1];
}
MATSUM.prototype.importset = function MATSUM() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.decomptyp = ary[1];
}
MATTRAN.prototype.importset = function MATTRAN() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.rule = ary[1];
}
MATZREIM.prototype.importset = function MATZREIM() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.decomptyp = ary[0];
}
MAXMIN.prototype.importset = function MAXMIN() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.mm = ary[0];
    this.nin = ary[1];
    this.zcr = ary[2];
}
MBLOCK.prototype.importset = function MBLOCK() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Tin = ary[0];
    this.Tintype = ary[1];
    this.Tout = ary[2];
    this.Touttype = ary[3];
    this.Tparam = ary[4];
    this.pprop = ary[5];
    this.Tfunam = ary[6];
}
MCLOCK_f.prototype.importset = function MCLOCK_f() {
    var block = getRparObjByGui(this.x, 'MFCLCK_f');
    if (block == null)
        return;
    var graphics = block.graphics;
    var ary = getData(graphics.exprs);
    this.period = ary[0];
    this.multiplyby = ary[1];
}
MFCLCK_f.prototype.importset = function MFCLCK_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.dt = ary[0];
    this.nn = ary[1];
}
M_freq.prototype.importset = function M_freq() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.frequ = ary[0];
    this.offset = ary[1];
}
Modulo_Count.prototype.importset = function Modulo_Count() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.ini_c = ary[0];
    this.base = ary[1];
    this.displayParameter = [this.base];
}
M_SWITCH.prototype.importset = function M_SWITCH() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nin = ary[0];
    this.base = ary[1];
    this.rule = ary[2];
}
MUX_f.prototype.importset = function MUX_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.in = ary[0];
}
MUX.prototype.importset = function MUX() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.in = ary[0];
}
NMOS.prototype.importset = function NMOS() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.W = ary[0];
    this.L = ary[1];
    this.Beta = ary[2];
    this.Vt = ary[3];
    this.K2 = ary[4];
    this.K5 = ary[5];
    this.dW = ary[6];
    this.dL = ary[7];
    this.RDS = ary[8];
}
NPN.prototype.importset = function NPN() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Bf = ary[0];
    this.Br = ary[1];
    this.Is = ary[2];
    this.Vak = ary[3];
    this.Tauf = ary[4];
    this.Taur = ary[5];
    this.Ccs = ary[6];
    this.Cje = ary[7];
    this.Cjc = ary[8];
    this.Phie = ary[9];
    this.Me = ary[10];
    this.Phic = ary[11];
    this.Mc = ary[12];
    this.Gbc = ary[13];
    this.Gbe = ary[14];
    this.Vt = ary[15];
    this.EMinMax = ary[16];
}
NRMSOM_f.prototype.importset = function NRMSOM_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nin = ary[0];
}
OpAmp.prototype.importset = function OpAmp() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.OLGain = ary[0];
    this.SatH = ary[1];
    this.SatL = ary[2];
}
OUT_f.prototype.importset = function OUT_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.prt = ary[0];
    this.displayParameter = [this.prt];
}
OUTIMPL_f.prototype.importset = function OUTIMPL_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.prt = ary[0];
    this.displayParameter = [this.prt];
}
PDE.prototype.importset = function PDE() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.rdnom = ary[0];
}
PerteDP.prototype.importset = function PerteDP() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.L = ary[0];
    this.D = ary[1];
    this.lambda = ary[2];
    this.z1 = ary[3];
    this.z2 = ary[4];
    this.p_rho = ary[5];
}
PID.prototype.importset = function PID() {
    /* TODO */
}
PMOS.prototype.importset = function PMOS() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.W = ary[0];
    this.L = ary[1];
    this.Beta = ary[2];
    this.Vt = ary[3];
    this.K2 = ary[4];
    this.K5 = ary[5];
    this.dW = ary[6];
    this.dL = ary[7];
    this.RDS = ary[8];
}
PNP.prototype.importset = function PNP() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Bf = ary[0];
    this.Br = ary[1];
    this.Is = ary[2];
    this.Vak = ary[3];
    this.Tauf = ary[4];
    this.Taur = ary[5];
    this.Ccs = ary[6];
    this.Cje = ary[7];
    this.Cjc = ary[8];
    this.Phie = ary[9];
    this.Me = ary[10];
    this.Phic = ary[11];
    this.Mc = ary[12];
    this.Gbc = ary[13];
    this.Gbe = ary[14];
    this.Vt = ary[15];
    this.EMinMax = ary[16];
}
POWBLK_f.prototype.importset = function POWBLK_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.a = ary[0];
}
PRODUCT.prototype.importset = function PRODUCT() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.sgn = ary[0];
}
PuitsP.prototype.importset = function PuitsP() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.P0 = ary[0];
    this.T0 = ary[1];
    this.H0 = ary[2];
    this.option_temperature = ary[3];
}
PULSE_SC.prototype.importset = function PULSE_SC() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.E = ary[0];
    this.W = ary[1];
    this.F = ary[2];
    this.A = ary[3];
}
QUANT_f.prototype.importset = function QUANT_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.pas = ary[0];
    this.meth = ary[1];
}
RAMP.prototype.importset = function RAMP() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.slope = ary[0];
    this.stt = ary[1];
    this.iout = ary[2];
}
RAND_m.prototype.importset = function RAND_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.flag = ary[1];
    this.a = ary[2];
    this.b = ary[3];
    this.seed_c = ary[4];
}
RATELIMITER.prototype.importset = function RATELIMITER() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.maxp = ary[0];
    this.minp = ary[1];
}
READAU_f.prototype.importset = function READAU_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.fname1 = ary[0];
    this.N = ary[1];
    this.swap = ary[2];
}
READC_f.prototype.importset = function READC_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tmask1 = ary[0];
    this.outmask = ary[1];
    this.fname1 = ary[2];
    this.frmt1 = ary[3];
    this.M = ary[4];
    this.N = ary[5];
    this.offset = ary[6];
    this.swap = ary[7];
}
REGISTER_f.prototype.importset = function REGISTER_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.z0 = ary[0];
}
REGISTER.prototype.importset = function REGISTER() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.z0 = ary[0];
    this.it = ary[1];
}
RELATIONALOP.prototype.importset = function RELATIONALOP() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.rule = ary[0];
    this.zcr = ary[1];
    if (ary.length >= 3) {
        this.Datatype = ary[2];
    }
    var label = "";
    switch (this.rule) {
        case "0": label = "=="; break;
        case "1": label = "~="; break;
        case "2": label = "<"; break;
        case "3": label = "<="; break;
        case "4": label = ">"; break;
        case "5": label = ">="; break;
    }
    this.displayParameter = [label];
}
RELAY_f.prototype.importset = function RELAY_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nin = ary[0];
    this.z0 = ary[1];
}
Resistor.prototype.importset = function Resistor() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.R = ary[0];
}
RFILE_f.prototype.importset = function RFILE_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tmask1 = ary[0];
    this.outmask = ary[1];
    this.fname1 = ary[2];
    this.frmt1 = ary[3];
    this.N = ary[4];
}
RICC.prototype.importset = function RICC() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.tpe = ary[0];
    this.mod = ary[1];
}
ROOTCOEF.prototype.importset = function ROOTCOEF() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.inp = ary[1];
}
SAMPHOLD_m.prototype.importset = function SAMPHOLD_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.it = ary[0];
}
SampleCLK.prototype.importset = function SampleCLK() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.frequ = ary[0];
    this.offset = ary[1];
}
SATURATION.prototype.importset = function SATURATION() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.maxp = ary[0];
    this.minp = ary[1];
    this.zeroc = ary[2];
}
SCALAR2VECTOR.prototype.importset = function SCALAR2VECTOR() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nout = ary[0];
}
scifunc_block_m.prototype.importset = function scifunc_block_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.i = ary[0];
    this.o = ary[1];
    this.ci = ary[2];
    this.co = ary[3];
    this.xx = ary[4];
    this.z = ary[5];
    this.rpar = ary[6];
    this.auto0 = ary[7];
    this.deptime = ary[8];
    this.displayParameter = [this.o]; // TODO: should come from popup 2
}
SELECT_m.prototype.importset = function SELECT_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.nin = ary[1];
    this.z0 = ary[2];
}
SHIFT.prototype.importset = function SHIFT() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Datatype = ary[0];
    this.nb = ary[1];
    this.np = ary[2];
    this.displayParameter = [this.nb];
}
Sigbuilder.prototype.importset = function Sigbuilder() {
    var block = getRparObjByGui(this.x, 'CURVE_c');
    if (block == null)
        return;
    /* TODO */
}
SIGNUM.prototype.importset = function SIGNUM() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.zcr = ary[0];
}
SineVoltage.prototype.importset = function SineVoltage() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.V = ary[0];
    this.ph = ary[1];
    this.frq = ary[2];
    this.offset = ary[3];
    this.start = ary[4];
    this.displayParameter = [this.V];
}
SourceP.prototype.importset = function SourceP() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.P0 = ary[0];
    this.T0 = ary[1];
    this.H0 = ary[2];
    this.option_temperature = ary[3];
}
SQRT.prototype.importset = function SQRT() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
}
SRFLIPFLOP.prototype.importset = function SRFLIPFLOP() {
    var block = getRparObjByGui(this.x, 'DOLLAR_m');
    if (block == null)
        return;
    var graphics = block.graphics;
    var ary = getData(graphics.exprs);
    this.initialvalue = ary[0];
}
STEP_FUNCTION.prototype.importset = function STEP_FUNCTION() {
    var block = getRparObjByGui(this.x, 'STEP');
    if (block == null)
        return;
    /* TODO */
}
SUBMAT.prototype.importset = function SUBMAT() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.typ = ary[0];
    this.a = ary[1];
    this.b = ary[2];
    this.c = ary[3];
    this.d = ary[4];
    this.inp = ary[5];
}
SUMMATION.prototype.importset = function SUMMATION() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Datatype = ary[0];
    this.sgn = ary[1];
    this.satur = ary[2];
}
SWITCH2_m.prototype.importset = function SWITCH2_m() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.ot = ary[0];
    this.rule = ary[1];
    this.thra = ary[2];
    this.nzz = ary[3];
}
SWITCH_f.prototype.importset = function SWITCH_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nin = ary[0];
    this.z0 = ary[1];
}
Switch.prototype.importset = function Switch() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Ron = ary[0];
    this.Roff = ary[1];
}
TCLSS.prototype.importset = function TCLSS() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.A = ary[0];
    this.B = ary[1];
    this.C = ary[2];
    this.D = ary[3];
    this.x0 = ary[4];
}
TEXT_f.prototype.importset = function TEXT_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.txt = ary[0];
    this.font = ary[1];
    this.siz = ary[2];
    this.displayParameter = [this.txt];
}
TIME_DELAY.prototype.importset = function TIME_DELAY() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.T = ary[0];
    this.init = ary[1];
    this.N = ary[2];
}
TKSCALE.prototype.importset = function TKSCALE() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.a = ary[0];
    this.b = ary[1];
    this.f = ary[2];
}
TOWS_c.prototype.importset = function TOWS_c() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.nz = ary[0];
    this.varnam = ary[1];
    this.herit = ary[2];
    this.displayParameter = [[this.varnam], [this.nz]];
}
TrigFun.prototype.importset = function TrigFun() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.fun = ary[0];
}
VanneReglante.prototype.importset = function VanneReglante() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.Cvmax = ary[0];
    this.p_rho = ary[1];
}
VARIABLE_DELAY.prototype.importset = function VARIABLE_DELAY() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.T = ary[0];
    this.init = ary[1];
    this.N = ary[2];
}
VsourceAC.prototype.importset = function VsourceAC() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.VA = ary[0];
    this.FR = ary[1];
    this.displayParameter = [[this.VA], [this.FR]];
}
VVsourceAC.prototype.importset = function VVsourceAC() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.FR = ary[0];
    this.displayParameter = [this.FR];
}
WRITEAU_f.prototype.importset = function WRITEAU_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.N = ary[0];
    this.swap = ary[1];
}
WRITEC_f.prototype.importset = function WRITEC_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.in = ary[0];
    this.fname1 = ary[1];
    this.frmt1 = ary[2];
    this.N = ary[3];
    this.swap = ary[4];
}
ZCROSS_f.prototype.importset = function ZCROSS_f() {
    var graphics = this.x.graphics;
    var ary = getData(graphics.exprs);
    this.in = ary[0];
}

/* Below code is autogenerated. Do not edit. */
ABS_VALUE.prototype.getContainer = function ABS_VALUE() { return new BasicBlock(this.x); }
AFFICH_m.prototype.getContainer = function AFFICH_m() { return new AfficheBlock(this.x); }
ANDBLK.prototype.getContainer = function ANDBLK() { return new BasicBlock(this.x); }
ANDLOG_f.prototype.getContainer = function ANDLOG_f() { return new BasicBlock(this.x); }
AUTOMAT.prototype.getContainer = function AUTOMAT() { return new BasicBlock(this.x); }
Bache.prototype.getContainer = function Bache() { return new BasicBlock(this.x); }
BACKLASH.prototype.getContainer = function BACKLASH() { return new BasicBlock(this.x); }
BARXY.prototype.getContainer = function BARXY() { return new BasicBlock(this.x); }
BIGSOM_f.prototype.getContainer = function BIGSOM_f() { return new BigSom(this.x); }
BITCLEAR.prototype.getContainer = function BITCLEAR() { return new BasicBlock(this.x); }
BITSET.prototype.getContainer = function BITSET() { return new BasicBlock(this.x); }
BOUNCE.prototype.getContainer = function BOUNCE() { return new BasicBlock(this.x); }
BOUNCEXY.prototype.getContainer = function BOUNCEXY() { return new BasicBlock(this.x); }
BPLATFORM.prototype.getContainer = function BPLATFORM() { return new BasicBlock(this.x); }
CANIMXY3D.prototype.getContainer = function CANIMXY3D() { return new BasicBlock(this.x); }
CANIMXY.prototype.getContainer = function CANIMXY() { return new BasicBlock(this.x); }
Capacitor.prototype.getContainer = function Capacitor() { return new BasicBlock(this.x); }
CBLOCK4.prototype.getContainer = function CBLOCK4() { return new BasicBlock(this.x); }
c_block.prototype.getContainer = function c_block() { return new BasicBlock(this.x); }
CBLOCK.prototype.getContainer = function CBLOCK() { return new BasicBlock(this.x); }
CCS.prototype.getContainer = function CCS() { return new BasicBlock(this.x); }
CEVENTSCOPE.prototype.getContainer = function CEVENTSCOPE() { return new BasicBlock(this.x); }
CFSCOPE.prototype.getContainer = function CFSCOPE() { return new BasicBlock(this.x); }
CLINDUMMY_f.prototype.getContainer = function CLINDUMMY_f() { return new BasicBlock(this.x); }
CLKFROM.prototype.getContainer = function CLKFROM() { return new BasicBlock(this.x); }
CLKGOTO.prototype.getContainer = function CLKGOTO() { return new BasicBlock(this.x); }
CLKGotoTagVisibility.prototype.getContainer = function CLKGotoTagVisibility() { return new BasicBlock(this.x); }
CLKINV_f.prototype.getContainer = function CLKINV_f() { return new EventInBlock(this.x); }
CLKOUTV_f.prototype.getContainer = function CLKOUTV_f() { return new EventOutBlock(this.x); }
CLKSOM_f.prototype.getContainer = function CLKSOM_f() { return new BasicBlock(this.x); }
CLKSOMV_f.prototype.getContainer = function CLKSOMV_f() { return new RoundBlock(this.x); }
CLOCK_c.prototype.getContainer = function CLOCK_c() { return new BasicBlock(this.x); }
CLR.prototype.getContainer = function CLR() { return new BasicBlock(this.x); }
CLSS.prototype.getContainer = function CLSS() { return new BasicBlock(this.x); }
CMAT3D.prototype.getContainer = function CMAT3D() { return new BasicBlock(this.x); }
CMATVIEW.prototype.getContainer = function CMATVIEW() { return new BasicBlock(this.x); }
CMSCOPE.prototype.getContainer = function CMSCOPE() { return new BasicBlock(this.x); }
ConstantVoltage.prototype.getContainer = function ConstantVoltage() { return new BasicBlock(this.x); }
CONST_f.prototype.getContainer = function CONST_f() { return new BasicBlock(this.x); }
CONST.prototype.getContainer = function CONST() { return new BasicBlock(this.x); }
CONST_m.prototype.getContainer = function CONST_m() { return new BasicBlock(this.x); }
CONSTRAINT2_c.prototype.getContainer = function CONSTRAINT2_c() { return new BasicBlock(this.x); }
CONSTRAINT_c.prototype.getContainer = function CONSTRAINT_c() { return new BasicBlock(this.x); }
CONVERT.prototype.getContainer = function CONVERT() { return new BasicBlock(this.x); }
COSBLK_f.prototype.getContainer = function COSBLK_f() { return new BasicBlock(this.x); }
Counter.prototype.getContainer = function Counter() { return new BasicBlock(this.x); }
CSCOPE.prototype.getContainer = function CSCOPE() { return new BasicBlock(this.x); }
CSCOPXY3D.prototype.getContainer = function CSCOPXY3D() { return new BasicBlock(this.x); }
CSCOPXY.prototype.getContainer = function CSCOPXY() { return new BasicBlock(this.x); }
CUMSUM.prototype.getContainer = function CUMSUM() { return new BasicBlock(this.x); }
CurrentSensor.prototype.getContainer = function CurrentSensor() { return new BasicBlock(this.x); }
CURV_f.prototype.getContainer = function CURV_f() { return new BasicBlock(this.x); }
CVS.prototype.getContainer = function CVS() { return new BasicBlock(this.x); }
DEADBAND.prototype.getContainer = function DEADBAND() { return new BasicBlock(this.x); }
DEBUG.prototype.getContainer = function DEBUG() { return new BasicBlock(this.x); }
DELAY_f.prototype.getContainer = function DELAY_f() { return new BasicBlock(this.x); }
DELAYV_f.prototype.getContainer = function DELAYV_f() { return new BasicBlock(this.x); }
DEMUX_f.prototype.getContainer = function DEMUX_f() { return new BasicBlock(this.x); }
DEMUX.prototype.getContainer = function DEMUX() { return new BasicBlock(this.x); }
DERIV.prototype.getContainer = function DERIV() { return new BasicBlock(this.x); }
DFLIPFLOP.prototype.getContainer = function DFLIPFLOP() { return new BasicBlock(this.x); }
DIFF_f.prototype.getContainer = function DIFF_f() { return new BasicBlock(this.x); }
Diode.prototype.getContainer = function Diode() { return new BasicBlock(this.x); }
DLATCH.prototype.getContainer = function DLATCH() { return new BasicBlock(this.x); }
DLRADAPT_f.prototype.getContainer = function DLRADAPT_f() { return new BasicBlock(this.x); }
DLR.prototype.getContainer = function DLR() { return new BasicBlock(this.x); }
DLSS.prototype.getContainer = function DLSS() { return new BasicBlock(this.x); }
DOLLAR_f.prototype.getContainer = function DOLLAR_f() { return new BasicBlock(this.x); }
DOLLAR.prototype.getContainer = function DOLLAR() { return new BasicBlock(this.x); }
DOLLAR_m.prototype.getContainer = function DOLLAR_m() { return new BasicBlock(this.x); }
EDGE_TRIGGER.prototype.getContainer = function EDGE_TRIGGER() { return new BasicBlock(this.x); }
EDGETRIGGER.prototype.getContainer = function EDGETRIGGER() { return new BasicBlock(this.x); }
ENDBLK.prototype.getContainer = function ENDBLK() { return new BasicBlock(this.x); }
END_c.prototype.getContainer = function END_c() { return new BasicBlock(this.x); }
ESELECT_f.prototype.getContainer = function ESELECT_f() { return new BasicBlock(this.x); }
EVTDLY_c.prototype.getContainer = function EVTDLY_c() { return new BasicBlock(this.x); }
EVTDLY_f.prototype.getContainer = function EVTDLY_f() { return new BasicBlock(this.x); }
EVTGEN_f.prototype.getContainer = function EVTGEN_f() { return new BasicBlock(this.x); }
EVTVARDLY.prototype.getContainer = function EVTVARDLY() { return new BasicBlock(this.x); }
EXPBLK_m.prototype.getContainer = function EXPBLK_m() { return new BasicBlock(this.x); }
// EXPRESSION.prototype.getContainer = function EXPRESSION() { return new BasicBlock(this.x); }
Extract_Activation.prototype.getContainer = function Extract_Activation() { return new BasicBlock(this.x); }
EXTRACTBITS.prototype.getContainer = function EXTRACTBITS() { return new BasicBlock(this.x); }
EXTRACT.prototype.getContainer = function EXTRACT() { return new BasicBlock(this.x); }
EXTRACTOR.prototype.getContainer = function EXTRACTOR() { return new BasicBlock(this.x); }
EXTTRI.prototype.getContainer = function EXTTRI() { return new BasicBlock(this.x); }
Flowmeter.prototype.getContainer = function Flowmeter() { return new BasicBlock(this.x); }
fortran_block.prototype.getContainer = function fortran_block() { return new BasicBlock(this.x); }
freq_div.prototype.getContainer = function freq_div() { return new BasicBlock(this.x); }
FROM.prototype.getContainer = function FROM() { return new BasicBlock(this.x); }
FROMMO.prototype.getContainer = function FROMMO() { return new BasicBlock(this.x); }
FROMWSB.prototype.getContainer = function FROMWSB() { return new BasicBlock(this.x); }
GAINBLK_f.prototype.getContainer = function GAINBLK_f() { return new BasicBlock(this.x); }
GAINBLK.prototype.getContainer = function GAINBLK() { return new BasicBlock(this.x); }
GAIN_f.prototype.getContainer = function GAIN_f() { return new BasicBlock(this.x); }
GENERAL_f.prototype.getContainer = function GENERAL_f() { return new BasicBlock(this.x); }
generic_block3.prototype.getContainer = function generic_block3() { return new BasicBlock(this.x); }
GENSIN_f.prototype.getContainer = function GENSIN_f() { return new BasicBlock(this.x); }
GENSQR_f.prototype.getContainer = function GENSQR_f() { return new BasicBlock(this.x); }
GOTO.prototype.getContainer = function GOTO() { return new BasicBlock(this.x); }
GOTOMO.prototype.getContainer = function GOTOMO() { return new BasicBlock(this.x); }
GotoTagVisibility.prototype.getContainer = function GotoTagVisibility() { return new BasicBlock(this.x); }
GotoTagVisibilityMO.prototype.getContainer = function GotoTagVisibilityMO() { return new BasicBlock(this.x); }
Ground.prototype.getContainer = function Ground() { return new GroundBlock(this.x); }
Gyrator.prototype.getContainer = function Gyrator() { return new BasicBlock(this.x); }
HALT_f.prototype.getContainer = function HALT_f() { return new BasicBlock(this.x); }
HYSTHERESIS.prototype.getContainer = function HYSTHERESIS() { return new BasicBlock(this.x); }
IdealTransformer.prototype.getContainer = function IdealTransformer() { return new BasicBlock(this.x); }
IFTHEL_f.prototype.getContainer = function IFTHEL_f() { return new BasicBlock(this.x); }
Inductor.prototype.getContainer = function Inductor() { return new BasicBlock(this.x); }
IN_f.prototype.getContainer = function IN_f() { return new ExplicitInBlock(this.x); }
INIMPL_f.prototype.getContainer = function INIMPL_f() { return new ImplicitInBlock(this.x); }
INTEGRAL_f.prototype.getContainer = function INTEGRAL_f() { return new BasicBlock(this.x); }
INTEGRAL_m.prototype.getContainer = function INTEGRAL_m() { return new BasicBlock(this.x); }
INTMUL.prototype.getContainer = function INTMUL() { return new BasicBlock(this.x); }
INTRP2BLK_f.prototype.getContainer = function INTRP2BLK_f() { return new BasicBlock(this.x); }
INTRPLBLK_f.prototype.getContainer = function INTRPLBLK_f() { return new BasicBlock(this.x); }
INVBLK.prototype.getContainer = function INVBLK() { return new BasicBlock(this.x); }
ISELECT_m.prototype.getContainer = function ISELECT_m() { return new BasicBlock(this.x); }
JKFLIPFLOP.prototype.getContainer = function JKFLIPFLOP() { return new BasicBlock(this.x); }
LOGBLK_f.prototype.getContainer = function LOGBLK_f() { return new BasicBlock(this.x); }
LOGICAL_OP.prototype.getContainer = function LOGICAL_OP() { return new BasicBlock(this.x); }
LOGIC.prototype.getContainer = function LOGIC() { return new BasicBlock(this.x); }
LOOKUP_f.prototype.getContainer = function LOOKUP_f() { return new BasicBlock(this.x); }
MATBKSL.prototype.getContainer = function MATBKSL() { return new BasicBlock(this.x); }
MATCATH.prototype.getContainer = function MATCATH() { return new BasicBlock(this.x); }
MATCATV.prototype.getContainer = function MATCATV() { return new BasicBlock(this.x); }
MATDET.prototype.getContainer = function MATDET() { return new BasicBlock(this.x); }
MATDIAG.prototype.getContainer = function MATDIAG() { return new BasicBlock(this.x); }
MATDIV.prototype.getContainer = function MATDIV() { return new BasicBlock(this.x); }
MATEIG.prototype.getContainer = function MATEIG() { return new BasicBlock(this.x); }
MATEXPM.prototype.getContainer = function MATEXPM() { return new BasicBlock(this.x); }
MATINV.prototype.getContainer = function MATINV() { return new BasicBlock(this.x); }
MATLU.prototype.getContainer = function MATLU() { return new BasicBlock(this.x); }
MATMAGPHI.prototype.getContainer = function MATMAGPHI() { return new BasicBlock(this.x); }
MATMUL.prototype.getContainer = function MATMUL() { return new BasicBlock(this.x); }
MATPINV.prototype.getContainer = function MATPINV() { return new BasicBlock(this.x); }
MATRESH.prototype.getContainer = function MATRESH() { return new BasicBlock(this.x); }
MATSING.prototype.getContainer = function MATSING() { return new BasicBlock(this.x); }
MATSUM.prototype.getContainer = function MATSUM() { return new BasicBlock(this.x); }
MATTRAN.prototype.getContainer = function MATTRAN() { return new BasicBlock(this.x); }
MATZCONJ.prototype.getContainer = function MATZCONJ() { return new BasicBlock(this.x); }
MATZREIM.prototype.getContainer = function MATZREIM() { return new BasicBlock(this.x); }
MAX_f.prototype.getContainer = function MAX_f() { return new BasicBlock(this.x); }
MAXMIN.prototype.getContainer = function MAXMIN() { return new BasicBlock(this.x); }
MBLOCK.prototype.getContainer = function MBLOCK() { return new BasicBlock(this.x); }
MCLOCK_f.prototype.getContainer = function MCLOCK_f() { return new BasicBlock(this.x); }
MFCLCK_f.prototype.getContainer = function MFCLCK_f() { return new BasicBlock(this.x); }
M_freq.prototype.getContainer = function M_freq() { return new BasicBlock(this.x); }
MIN_f.prototype.getContainer = function MIN_f() { return new BasicBlock(this.x); }
Modulo_Count.prototype.getContainer = function Modulo_Count() { return new BasicBlock(this.x); }
M_SWITCH.prototype.getContainer = function M_SWITCH() { return new BasicBlock(this.x); }
MUX_f.prototype.getContainer = function MUX_f() { return new BasicBlock(this.x); }
MUX.prototype.getContainer = function MUX() { return new BasicBlock(this.x); }
NEGTOPOS_f.prototype.getContainer = function NEGTOPOS_f() { return new BasicBlock(this.x); }
NMOS.prototype.getContainer = function NMOS() { return new BasicBlock(this.x); }
NPN.prototype.getContainer = function NPN() { return new BasicBlock(this.x); }
NRMSOM_f.prototype.getContainer = function NRMSOM_f() { return new BasicBlock(this.x); }
OpAmp.prototype.getContainer = function OpAmp() { return new BasicBlock(this.x); }
OUT_f.prototype.getContainer = function OUT_f() { return new ExplicitOutBlock(this.x); }
OUTIMPL_f.prototype.getContainer = function OUTIMPL_f() { return new ImplicitOutBlock(this.x); }
PDE.prototype.getContainer = function PDE() { return new BasicBlock(this.x); }
PerteDP.prototype.getContainer = function PerteDP() { return new BasicBlock(this.x); }
PID.prototype.getContainer = function PID() { return new BasicBlock(this.x); }
PMOS.prototype.getContainer = function PMOS() { return new BasicBlock(this.x); }
PNP.prototype.getContainer = function PNP() { return new BasicBlock(this.x); }
POSTONEG_f.prototype.getContainer = function POSTONEG_f() { return new BasicBlock(this.x); }
PotentialSensor.prototype.getContainer = function PotentialSensor() { return new BasicBlock(this.x); }
POWBLK_f.prototype.getContainer = function POWBLK_f() { return new BasicBlock(this.x); }
PROD_f.prototype.getContainer = function PROD_f() { return new RoundBlock(this.x); }
PRODUCT.prototype.getContainer = function PRODUCT() { return new Product(this.x); }
PuitsP.prototype.getContainer = function PuitsP() { return new BasicBlock(this.x); }
PULSE_SC.prototype.getContainer = function PULSE_SC() { return new BasicBlock(this.x); }
QUANT_f.prototype.getContainer = function QUANT_f() { return new BasicBlock(this.x); }
RAMP.prototype.getContainer = function RAMP() { return new BasicBlock(this.x); }
RAND_m.prototype.getContainer = function RAND_m() { return new BasicBlock(this.x); }
RATELIMITER.prototype.getContainer = function RATELIMITER() { return new BasicBlock(this.x); }
READAU_f.prototype.getContainer = function READAU_f() { return new BasicBlock(this.x); }
READC_f.prototype.getContainer = function READC_f() { return new BasicBlock(this.x); }
REGISTER_f.prototype.getContainer = function REGISTER_f() { return new BasicBlock(this.x); }
REGISTER.prototype.getContainer = function REGISTER() { return new BasicBlock(this.x); }
RELATIONALOP.prototype.getContainer = function RELATIONALOP() { return new BasicBlock(this.x); }
RELAY_f.prototype.getContainer = function RELAY_f() { return new BasicBlock(this.x); }
Resistor.prototype.getContainer = function Resistor() { return new BasicBlock(this.x); }
RFILE_f.prototype.getContainer = function RFILE_f() { return new BasicBlock(this.x); }
RICC.prototype.getContainer = function RICC() { return new BasicBlock(this.x); }
ROOTCOEF.prototype.getContainer = function ROOTCOEF() { return new BasicBlock(this.x); }
SAMPHOLD_m.prototype.getContainer = function SAMPHOLD_m() { return new BasicBlock(this.x); }
SampleCLK.prototype.getContainer = function SampleCLK() { return new BasicBlock(this.x); }
SATURATION.prototype.getContainer = function SATURATION() { return new BasicBlock(this.x); }
SAWTOOTH_f.prototype.getContainer = function SAWTOOTH_f() { return new BasicBlock(this.x); }
SCALAR2VECTOR.prototype.getContainer = function SCALAR2VECTOR() { return new BasicBlock(this.x); }
scifunc_block_m.prototype.getContainer = function scifunc_block_m() { return new BasicBlock(this.x); }
SELECT_m.prototype.getContainer = function SELECT_m() { return new BasicBlock(this.x); }
SELF_SWITCH.prototype.getContainer = function SELF_SWITCH() { return new BasicBlock(this.x); }
SHIFT.prototype.getContainer = function SHIFT() { return new BasicBlock(this.x); }
Sigbuilder.prototype.getContainer = function Sigbuilder() { return new BasicBlock(this.x); }
SIGNUM.prototype.getContainer = function SIGNUM() { return new BasicBlock(this.x); }
SINBLK_f.prototype.getContainer = function SINBLK_f() { return new BasicBlock(this.x); }
SineVoltage.prototype.getContainer = function SineVoltage() { return new BasicBlock(this.x); }
SOM_f.prototype.getContainer = function SOM_f() { return new BasicBlock(this.x); }
SourceP.prototype.getContainer = function SourceP() { return new BasicBlock(this.x); }
SQRT.prototype.getContainer = function SQRT() { return new BasicBlock(this.x); }
SRFLIPFLOP.prototype.getContainer = function SRFLIPFLOP() { return new BasicBlock(this.x); }
STEP_FUNCTION.prototype.getContainer = function STEP_FUNCTION() { return new BasicBlock(this.x); }
SUBMAT.prototype.getContainer = function SUBMAT() { return new BasicBlock(this.x); }
SUM_f.prototype.getContainer = function SUM_f() { return new RoundBlock(this.x); }
SUMMATION.prototype.getContainer = function SUMMATION() { return new Summation(this.x); }
SUPER_f.prototype.getContainer = function SUPER_f() { return new SuperBlock(this.x); }
SWITCH2_m.prototype.getContainer = function SWITCH2_m() { return new BasicBlock(this.x); }
SWITCH_f.prototype.getContainer = function SWITCH_f() { return new BasicBlock(this.x); }
Switch.prototype.getContainer = function Switch() { return new BasicBlock(this.x); }
TANBLK_f.prototype.getContainer = function TANBLK_f() { return new BasicBlock(this.x); }
TCLSS.prototype.getContainer = function TCLSS() { return new BasicBlock(this.x); }
TEXT_f.prototype.getContainer = function TEXT_f() { return new TextBlock(this.x); }
TIME_DELAY.prototype.getContainer = function TIME_DELAY() { return new BasicBlock(this.x); }
TIME_f.prototype.getContainer = function TIME_f() { return new BasicBlock(this.x); }
TKSCALE.prototype.getContainer = function TKSCALE() { return new BasicBlock(this.x); }
TOWS_c.prototype.getContainer = function TOWS_c() { return new BasicBlock(this.x); }
TRASH_f.prototype.getContainer = function TRASH_f() { return new BasicBlock(this.x); }
TrigFun.prototype.getContainer = function TrigFun() { return new BasicBlock(this.x); }
VanneReglante.prototype.getContainer = function VanneReglante() { return new BasicBlock(this.x); }
VARIABLE_DELAY.prototype.getContainer = function VARIABLE_DELAY() { return new BasicBlock(this.x); }
VariableResistor.prototype.getContainer = function VariableResistor() { return new BasicBlock(this.x); }
VirtualCLK0.prototype.getContainer = function VirtualCLK0() { return new BasicBlock(this.x); }
VoltageSensor.prototype.getContainer = function VoltageSensor() { return new VoltageSensorBlock(this.x); }
VsourceAC.prototype.getContainer = function VsourceAC() { return new BasicBlock(this.x); }
VVsourceAC.prototype.getContainer = function VVsourceAC() { return new BasicBlock(this.x); }
WRITEAU_f.prototype.getContainer = function WRITEAU_f() { return new BasicBlock(this.x); }
WRITEC_f.prototype.getContainer = function WRITEC_f() { return new BasicBlock(this.x); }
ZCROSS_f.prototype.getContainer = function ZCROSS_f() { return new BasicBlock(this.x); }
