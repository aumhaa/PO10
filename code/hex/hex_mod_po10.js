//Hexadecimal
//by amounra
//aumhaa@gmail.com --- http://www.aumhaa.com


/*This patch is the evolution of the binary mod;  The majority of the functionality for the entire patch
can be modified in this js or the accompanying poly~ object, "steppr_wheel", without ever opening
the actual containing patch in the m4l editor (this was crucial for speeding up the development process).
Because of this, the functionality of the patch can be radically altered merely by modifying the
poly~ or adding some lines of code in to this js.  As an example, the poly~ used as the base for
this patch is only a slightly modified version of the "binary" mod (from Monomodular), and the
majority of processes in this script are maintained between both versions.*/

/*It should be noted that many of the processes used in "binary" are still available yet unused
in this script, offering some excellent prospects for the future development of this mod.*/

autowatch = 1;

outlets = 4;
inlets = 5;

var script = this;

aumhaa = require('_base');
//aumhaa.init_deprecated_prototypes(this);
var FORCELOAD = false;
var DEBUG = false;
aumhaa.init(this);

var NEW_DEBUG = false;
var DEBUG_LCD = false;
var DEBUG_PTR = false;
var DEBUG_STEP = false;
var DEBUG_BLINK = false;
var DEBUG_REC = false;
var DEBUG_LOCK = false;
var DEBUGANYTHING = false;
var DEBUGSETTER = false;
var SHOW_POLYSELECTOR = false;
var SHOW_STORAGE = false;
var MOD_DEBUG = false;


var newdebug = (NEW_DEBUG&&Debug) ? Debug : function(){};
var debuglcd = (DEBUG_LCD&&Debug) ? Debug : function(){};
var debugptr = (DEBUG_PTR&&Debug) ? Debug :function(){};
var debugstep = (DEBUG_STEP&&Debug) ? Debug : function(){};
var debugblink = (DEBUG_BLINK&&Debug) ? Debug : function(){};
var debugrec = (DEBUG_REC&&Debug) ? Debug : function(){};
var debuganything = (DEBUGANYTHING&&Debug) ? Debug : function(){};
var debugSETTER = (DEBUGSETTER&&Debug) ? Debug : function(){};
var forceload = (FORCELOAD&&Forceload) ? Forceload : function(){};

var finder;
var mod;
var mod_finder;
var found_mod;

var Mod = ModComponent.bind(script);
var ModProxy = ModProxyComponent.bind(script);

var unique = jsarguments[1];

//this array contains the scripting names of objects in the top level patcher.	To include an new object to be addressed
//in this script, it's only necessary to add its name to this array.  It can then be addressed as a direct variable
var Vars = ['poly', 'pipe', 'selected_filter', 'step', 'storepattr', 'storage', 'preset_selector', 'padgui', 'padmodegui', 'keygui', 'keymodegui', 'repeatgui',
			'rotleftgui', 'rotrightgui', 'notevaluesgui', 'notetypegui', 'stepmodegui', 'keymodeadv', 'Groove', 'Random', 'Channel', 'Mode', 'PolyOffset', 'BaseTime',
			'timeupgui', 'timedngui', 'pitchupgui', 'pitchdngui', 'transposegui', 'playgui', 'recgui', 'directiongui', 'lockgui','lockgui', 'Speed',
			'Speed1', 'Speed2', 'Speed3', 'Speed4', 'Speed5', 'Speed6', 'Speed7', 'Speed8', 'Speed9', 'Speed10', 'Speed11', 'Speed12', 'Speed13', 'Speed14', 'Speed15', 'Speed16',
			'rotgate', 'transport_change', 'midiout', 'Multiplier', 'quantgui'];

//this array contains the scripting names of pattr-linked objects in each of the polys. To include an new object to be addressed
//in the poly, it's only necessary to add its name to this array.  It can then be addressed as part[poly number].obj[its scripting name]
var Objs = {'pattern':{'Name':'pattern', 'Type':'list', 'pattr':'pattern'},
			'duration':{'Name':'duration', 'Type':'list', 'pattr':'duration'},
			'velocity':{'Name':'velocity', 'Type':'list', 'pattr':'velocity'},
			'note':{'Name':'note', 'Type':'list', 'pattr':'note'},
			'behavior':{'Name':'behavior', 'Type':'list', 'pattr':'behavior'},
			'rulebends':{'Name':'rulebends', 'Type':'list', 'pattr':'rulebends'},
			'mode':{'Name':'mode', 'Type':'int', 'pattr':'mode'},
			'polyenable':{'Name':'polyenable', 'Type':'int', 'pattr':'polyenable'},
			'swing':{'Name':'swing', 'Type':'float', 'pattr':'swingpattr'},
			'steps':{'Name':'steps', 'Type':'int', 'pattr':'stepspattr'},
			'channel':{'Name':'channel', 'Type':'int', 'pattr':'hidden'},
			'direction':{'Name':'direction', 'Type':'int', 'pattr':'directionpattr'},
			'nudge':{'Name':'nudge', 'Type':'int', 'pattr':'nudgepattr'},
			'noteoffset':{'Name':'noteoffset', 'Type':'int', 'pattr':'hidden'},
			'random':{'Name':'random', 'Type':'float', 'pattr':'randompattr'},
			'polyoffset':{'Name':'polyoffset', 'Type':'int', 'pattr':'polyoffsetpattr'},
			'repeatenable':{'Name':'repeatenable', 'Type':'int', 'pattr':'object'},
			'polyplay':{'Name':'polyplay', 'Type':'int', 'pattr':'object'},
			'notevalues':{'Name':'notevalues', 'Type':'int', 'pattr':'notevaluepattr'},
			'notetype':{'Name':'notetype', 'Type':'int', 'pattr':'notetypepattr'},
			'quantize':{'Name':'quantize', 'Type':'int', 'pattr':'hidden'},
			'active':{'Name':'active', 'Type':'int', 'pattr':'active'},
			'offset':{'Name':'offset', 'Type':'int', 'pattr':'hidden'},
			'addnote':{'Name':'addnote', 'Type':'int', 'pattr':'object'},
			'patterncoll':{'Name':'patterncoll', 'Type':'list', 'pattr':'object'},
			'last_trigger':{'Name':'last_trigger', 'Type':'bang', 'pattr':'object'},
			'clutch':{'Name':'clutch', 'Type':'int', 'pattr':'object'},
			'restart':{'Name':'restart', 'Type':'bang', 'pattr':'object'},
			'repeat':{'Name':'repeat', 'Type':'int', 'pattr':'hidden'},
			'restartcount':{'Name':'restartcount', 'Type':'int', 'pattr':'object'},
			'basetime':{'Name':'basetime', 'Type':'int', 'pattr':'basetimepattr'},
			'timedivisor':{'Name':'timedivisor', 'Type':'int', 'pattr':'timedivisorpattr'},
			'nexttime':{'Name':'nexttime', 'Type':'set', 'pattr':'object'},
			'behavior_enable':{'Name':'behavior_enable', 'Type':'int', 'pattr':'hidden'},
			'multiplier':{'Name':'multiplier', 'Type':'float', 'pattr':'multiplierpattr'}
			};

/*			'phasor':{'Name':'phasor', 'Type':'float', 'pattr':'object'},
			'phasor_free':{'Name':'phasor_free', 'Type':'float', 'pattr':'object'},
			'ticks':{'Name':'ticks', 'Type':'float', 'pattr':'hidden'},
*/

var HEX_SPEED_1 = ['ModDevice_Speed1', 'ModDevice_Speed2', 'ModDevice_Speed3', 'ModDevice_Speed4', 'ModDevice_Speed5', 'ModDevice_Speed6', 'ModDevice_Speed7', 'ModDevice_Speed8', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3']
var HEX_SPEED_2 = ['ModDevice_Speed9', 'ModDevice_Speed10', 'ModDevice_Speed11', 'ModDevice_Speed12', 'ModDevice_Speed13', 'ModDevice_Speed14', 'ModDevice_Speed15', 'ModDevice_Speed16', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3']

/*var HEX_BANKS = {'InstrumentGroupDevice':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'Filter', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Macro 1', 'Macro 2', 'Macro 3', 'Macro 4', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'DrumGroupDevice':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'Filter', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Macro 1', 'Macro 2', 'Macro 3', 'Macro 4', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'MidiEffectGroupDevice':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'Filter', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Macro 1', 'Macro 2', 'Macro 3', 'Macro 4', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'Other':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'Filter', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['None', 'None', 'None', 'None', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'Operator':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'Filter Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime','Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Osc-A Level', 'Osc-B Level', 'Osc-C Level', 'Osc-D Level', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'UltraAnalog':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'F1 Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['AEG1 Attack', 'AEG1 Decay', 'AEG1 Sustain', 'AEG1 Rel', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'OriginalSimpler':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'Filter Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Ve Attack', 'Ve Decay', 'Ve Sustain', 'Ve Release', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'MultiSampler':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'Filter Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Ve Attack', 'Ve Decay', 'Ve Sustain', 'Ve Release', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'LoungeLizard':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'P Distance', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['M Force', 'F Release', 'F Tone Decay', 'F Tone Vol', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'StringStudio':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'Semitone', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['E Pos', 'Exc ForceMassProt', 'Exc FricStiff', 'Exc Velocity', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'Collision':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'Res 1 Tune', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Noise Attack', 'Noise Decay', 'Noise Sustain', 'Noise Release', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'InstrumentImpulse':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2',  'ModDevice_moddial', '1 Filter Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime','Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['1 Start', '1 Envelope Decay', '1 Stretch Factor', 'Global Time', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'NoDevice':[['ModDevice_Speed', 'Mod_Chain_Return_0', 'Mod_Chain_Return_1', 'Mod_Chain_Return_2', 'ModDevice_moddial', 'None', 'None', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime','Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2]}
*/
var HEX_BANKS = {'InstrumentGroupDevice':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'Filter', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Macro 1', 'Macro 2', 'Macro 3', 'Macro 4', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'DrumGroupDevice':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'Filter', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Macro 1', 'Macro 2', 'Macro 3', 'Macro 4', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'MidiEffectGroupDevice':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'Filter', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Macro 1', 'Macro 2', 'Macro 3', 'Macro 4', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'Other':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'Filter', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['None', 'None', 'None', 'None', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'Operator':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'Filter Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime','Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Osc-A Level', 'Osc-B Level', 'Osc-C Level', 'Osc-D Level', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'UltraAnalog':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'F1 Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['AEG1 Attack', 'AEG1 Decay', 'AEG1 Sustain', 'AEG1 Rel', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'OriginalSimpler':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'Filter Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Ve Attack', 'Ve Decay', 'Ve Sustain', 'Ve Release', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'MultiSampler':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'Filter Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Ve Attack', 'Ve Decay', 'Ve Sustain', 'Ve Release', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'LoungeLizard':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'P Distance', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['M Force', 'F Release', 'F Tone Decay', 'F Tone Vol', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'StringStudio':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'Semitone', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['E Pos', 'Exc ForceMassProt', 'Exc FricStiff', 'Exc Velocity', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'Collision':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'Res 1 Tune', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['Noise Attack', 'Noise Decay', 'Noise Sustain', 'Noise Release', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'InstrumentImpulse':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3',  'ModDevice_moddial', '1 Filter Freq', 'Transpose', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime','Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['1 Start', '1 Envelope Decay', '1 Stretch Factor', 'Global Time', 'ModDevice_PolyOffset', 'ModDevice_Mode', 'ModDevice_Speed', 'Mod_Chain_Vol', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2],
			'NoDevice':[['ModDevice_Speed', 'CustomParameter_1', 'CustomParameter_2', 'CustomParameter_3', 'ModDevice_moddial', 'None', 'None', 'ModDevice_Multiplier', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime','Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], ['None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'ModDevice_Channel', 'ModDevice_Groove', 'ModDevice_Random', 'ModDevice_BaseTime', 'Mod_Chain_Send_0', 'Mod_Chain_Send_1', 'Mod_Chain_Send_2', 'Mod_Chain_Send_3'], HEX_SPEED_1, HEX_SPEED_2]}


var Modes=[4, 2, 3, 5, 1];
var RemotePModes=[0, 1, 4];
var Funcs = ['stepNote', 'stepVel', 'stepDur', 'stepExtra1', 'stepExtra2'];
var default_pattern = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var default_step_pattern = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var default_duration = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
var default_note = [[1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0],[1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0],[1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0]];
var default_velocity = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
var empty = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
var modes = [[0, 2, 4, 5, 7, 9, 11, 12], [0, 2, 3, 5, 7, 9, 10, 12], [0, 1, 3, 5, 7, 8, 10, 12], [0, 2, 4, 6, 7, 9, 11, 12], [0, 2, 4, 5, 7, 9, 10, 12], [0, 2, 3, 5, 7, 8, 10, 12], [0, 1, 3, 5, 6, 8, 10, 12]];
var Colors = [0, 1, 2, 3, 4, 5, 6, 127];
var StepColors = [127, 3, 3, 3, 127, 3, 3, 3, 127, 3, 3, 3, 127, 3, 3, 3 ];
var SelectColors = [1, 5, 4, 6];
var AddColors = [5, 6];
var Blinks=[-1, 2];
var modColor = 5;
var TVEL_COLORS = [1,2,3,4];
var BEHAVE_COLORS = [0, 1, 2, 3, 4, 5, 6, 127];
var TIMES = {'1':0, '2':1, '4':2, '8':3, '16':4, '32':5, '64':6, '128':7};
var ACCENTS = [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
var ACCENT_VALS = [63, 87, 111, 127];
var TRANS = {0:[[1, 1], [1, 2], [1, 4], [1, 8], [1, 16], [1, 32], [1, 64], [1, 128]],
				1:[[3, 2], [3, 4], [3, 8], [3, 16], [3, 32], [3, 64], [3, 128], [1, 128]],
				2:[[2, 3], [1, 3], [1, 6], [1, 12], [1, 24], [1, 48], [1, 96], [1, 128]]};
var ENC_COLORS = [5, 5, 127, 127, 6, 1, 2, 2];
var MODE_COLORS = [2, 5, 1, 3, 6, 4, 7, 2];
var DEFAULT_MOD_PARAM_VALUES = [50, 0, 0, 0, 127, 127, 52, 42];
var custom_device_ids = [0,0,0,0];
/*Naming the js instance as script allows us to create scoped variables
(properties of js.this) without specifically declaring them with var
during the course of the session. This allows dynamic creation of
objects without worrying about declaring them beforehand as globals
presumably gc() should be able to do its job when the patch closes, or
if the variables are redclared.	 I'd love to know if this works the
way I think it does.*/

var script = this;
var autoclip;

var part =[];

//var live_set;
//var song_tempo = 120;

var KEYMODES = ['mute', 'length', 'behaviour', 'single preset', 'global preset', 'polyrec', 'polyplay', 'accent'];
var PADMODES = ['select', 'add', 'mute', 'preset', 'global', 'freewheel', 'play'];
var STEPMODES = ['active', 'velocity', 'duration', 'rulebends', 'pitch'];
var GRIDMODES = ['hex', 'tr256', 'polygome', 'cafe', 'boinngg', 'none', 'none', 'behaviour'];
var CODECMODES = ['velocity', 'duration', 'behaviour', 'pitch'];

var Alive=0;
var step_mode = 0;
var pad_mode = 0;
var key_mode = 0;
var grid_mode = 0;
var codec_mode = 0;
var solo_mode = 0;
var last_mode = 1;
var last_key_mode = 0;
var last_pad_mode = 0;
var locked = 0;
var shifted = false;
//var play_mode = 0;

var selected;
var presets = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
var devices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var drumgroup_is_present = false;
var preset = 1;
var last_mask = 0;
var global_offset = 0;
var global_chain_offset = 0;
var pad_invoked_key_mode = 3;
var timing_immediate = 0;
var transpose_steps = 1;
var record_enabled = 0;
var play_enabled = 0;
var randomize_global = 0;
var last_blink = 0;
var rot_length = 4;
var step_value = [];
var key_pressed = -1;
var pad_pressed = -1;
var grid_pressed = -1;
var current_step = 0;
var autoclip;
var dirty = 0;
var keymodeenables = [0, 1, 2, 3, 4, 5, 6, 7];
var padmodeenables = [0, 1, 2, 3, 4, 5];

//new props
var sel_vel = 0;
var altVal = 0;
var ColNOTE = 1;
var RowNOTE = 2;
var curSteps = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var edit_preset = 1;
var btn_press1 = 0;
var btn_press2 = 0;
var last_mutes = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
var boing_pattern = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var Tvel = 2;
var rec_enabled = 0;
var behavegraph = [];
for(var i=0;i<7;i++){
	behavegraph[i]=[];
	for(var j=0;j<8;j++){
		behavegraph[i][j]=0;
	}
}

var current_rule = 0;
var bitcrusherOnOff_api;
var bitcrusherOnOff_value;

/*/////////////////////////////////////////
///// script initialization routines //////
/////////////////////////////////////////*/


/*	VERY IMPORTANT!! : This code utilizes a naming convention for private functions:  any function
preceeded by an underscore is considered private, but will have a public function reference
assigned to it AFTER the script has received an initiallization call from mod.js.  That means that any
function that shouldn't be accessed before initialization can be created as a private function without
the need to use an internal testing routine to find out whether the script has init()ed.

Example:

If we create _private_function(), and before init a call from max comes in to private_function(), that call
will be funneled to anything().	 After init(), however, all calls to private_function() will be forwarded to
_private_function().

Note:  It is best to only address these private functions by their actual names in the script, since calling aliased
names will not be routed to anything().*/

var Mod = ModComponent.bind(script);

function init()
{
	debug('INIT_______________________________');
	mod = new ModProxy(script, ['Send', 'SendDirect', 'restart']);
	found_mod = new Mod(script, 'hex', unique, false);
	//found_mod.debug = debug;
	if(MOD_DEBUG){found_mod.debug = debug;}
	mod_finder = new LiveAPI(mod_callback, 'this_device');
	found_mod.assign_api(mod_finder);


	setup_translations();
	setup_colors();
	for(var i in Vars)
	{
		script[Vars[i]] = this.patcher.getnamed(Vars[i]);
	}
	var y=15;do{
		script['poly.'+(y+1)+'::pattern'] = make_pset_edit_input(y);
		script['poly.'+(y+1)+'::velocity'] = make_tvel_edit_input(y);
	}while(y--);
	for(var i = 0; i < 16; i++)
	{
		var poly_num = i;
		storage.message('priorty', 'poly.'+(poly_num+1), 'tickspattr', 10);
		storage.message('priorty', 'poly.'+(poly_num+1),  'notetypepattr', 11);
		storage.message('priorty', 'poly.'+(poly_num+1),  'notevaluepattr', 12);
		part[i] = {'n': 'part', 'num':i, 'nudge':0, 'offset':0, 'channel':0, 'len':16, 'start':0,
					'jitter':0, 'active':1, 'swing':.5, 'lock':1, 'ticks':480, 'notevalues':3, 'notetype':0,
					'pushed':0, 'direction':0, 'noteoffset':i, 'root':i, 'octave':0, 'add':0, 'quantize':1, 'repeat':6, 'clutch':1,
					'random':0, 'note':i, 'steps':11, 'mode':0, 'polyenable':0, 'polyoffset':36, 'mode':0, 'multiplier':1,
					'hold':0, 'held':[], 'triggered':[], 'recdirty':0, 'timedivisor':16, 'basetime':1, 'behavior_enable':1};//'speed':480,'notevalue':'4n'
		part[i].num = parseInt(i);
		part[i].pattern = default_pattern.slice();
		part[i].edit_buffer = default_pattern.slice();
		part[i].edit_velocity = default_velocity.slice();
		part[i].step_pattern = default_step_pattern.slice();
		part[i].duration = default_duration.slice();
		part[i].velocity = default_velocity.slice();
		part[i].behavior = default_pattern.slice();
		part[i].rulebends = default_pattern.slice();
		part[i].note = default_pattern.slice();
		part[i].obj = [];
		part[i].obj.set = [];
		part[i].obj.get = [];
		for(var j in Objs)
		{
			//debug(Objs[j].Name);
			part[i].obj[Objs[j].Name] = this.patcher.getnamed('poly').subpatcher(poly_num).getnamed(Objs[j].Name);
			part[i].obj.set[Objs[j].Name] = make_obj_setter(part[i], Objs[j]);
			part[i].obj.get[Objs[j].Name] = make_obj_getter(part[i], Objs[j]);
		}
		part[i].funcs = make_funcs(part[i]);
		script['Speed'+(i+1)].message('set', part[i].obj.timedivisor.getvalueof());
		//part[i].notes_assignment = part[i].obj.notes.getvalueof();
		//part[i].note = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		//part[i].note = default_note.slice();
		//part[i].note = i;
	}
	script.rulemap = this.patcher.getnamed('settings').subpatcher().getnamed('rulemap');
	this.patcher.getnamed('poly').message('target', 0);
	selected_filter.message('offset', 1);
	autoclip = new LiveAPI(callback, 'live_set');
	step.message('int', 1);
	messnamed(unique+'restart', 1);
	transport_change.message('set', -1);
	selected = part[0];
	mod.Send('receive_device', 'set_number_custom', 4);
	init_device();
	deprivatize_script_functions(this);
	//for(var i in script)
	//{
	//	if((/^_/).test(i))
	//	{
			//debug('replacing', i);
	//		script[i.replace('_', "")] = script[i];
	//	}
	//}
	Alive = 1;
	clear_surface();

	storage.message('recall', 1);

	refresh_extras();
	select_pattern(0);

	mod.Send('receive_device', 'set_mod_device_type', 'Hex');
	mod.Send( 'receive_device', 'set_number_params', 16);
	//mod.Send( 'push_name_display', 'value', 0, 'Worky?');
	//mod.Send( 'push_alt_name_display', 'value', 1, 'Worky!');

	rotgate.message('int', 1);
	messnamed(unique+'ColNOTE', ColNOTE);
	messnamed(unique+'RowNOTE', RowNOTE);
	this.patcher.getnamed('polyselector').hidden = Math.abs(SHOW_POLYSELECTOR-1);
	if(SHOW_STORAGE)
	{
		this.patcher.getnamed('storage').message('clientwindow');
		this.patcher.getnamed('storage').message('storagewindow');
	}
	post("Hex initialized.\n");
	//mod.Send( 'set_mod_color', modColor);
	//mod.Send( 'set_color_map', 'Monochrome', 127, 127, 127, 15, 22, 29, 36, 43);
	//mod.Send( 'set_report_offset', 1);
	/*var i=7;do{
		mod.Send( 'key', i, (i==grid_mode)*8);
		mod.Send( 'grid', i, 6, ENC_COLORS[i]);
	}while(i--);*/
	var i=3;do{
		mod.Send( 'cntrlr_encoder_grid', 'mode', i, 2, 0);
	}while(i--);
	keymodegui.message('int', 8);
	mod.Send('grid', 'value', 0, 0, 1);
	//mod.Send('recieve_translation', )
	select_pattern(0);
}
// else
// {
// 	_dissolve();
// }
// }

function mod_callback(args)
{
	if((args[0]=='value')&&(args[1]!='bang'))
	{
		// debug('mod callback:', args);
		if(args[1] in script)
		{
			script[args[1]].apply(script, args.slice(2));
		}
		if(args[1]=='disconnect')
		{
			mod.restart.schedule(3000);
		}
	}
}

function alive(val)
{
	initialize(val);
}

//called when mod.js is finished loading for the first time
function initialize(val)
{
	if(val>0)
	{
		debug('hex init');
		mod=found_mod;
	}
}



//make a closure to hold the setter function for any object in the poly patcher that is contained in the Objs dict
function make_obj_setter(part, obj)
{
	if(obj.pattr == 'hidden')
	{
		var setter = function(val)
		{
			if(val!=undefined)
			{
				debugSETTER('setter hidden', obj.Name, val);
				var num = part.num;
				part[obj.Name] = val;
				part.obj[obj.Name].message(obj.Type, val);
			}
		}
	}
	else if(obj.pattr == 'object')
	{
		if(obj.Type == 'bang')
		{
			var setter = function(val)
			{
				if(val!=undefined)
				{
					debugSETTER('setter bang');
					part[obj.Name].message('bang');
				}
			}
		}
		else
		{
			var setter = function(val)
			{
				debugSETTER('setter object');
				if(val!=undefined)
				{
					part[obj.Name] = val;
					part.obj[obj.Name].message(obj.Type, val);
				}
			}
		}
	}
	else
	{
		var setter = function(val, pset)
		{
			if(val!=undefined)
			{
				debugSETTER('setter pattr');
				var num = part.num;
				if(!pset){
					var pset = presets[num];
					part[obj.Name] = val;
					part.obj[obj.Name].message(obj.Type, val);
				}
				if(!locked)
				{
					debugSETTER('storing', obj.Name, 'in', obj.pattr, 'at', pset, 'with', val);
					storage.setstoredvalue('poly.'+(num+1)+'::'+obj.pattr, pset, val);
				}
			}
		}
	}
	return setter;
}

//make a closure to hold the getter function for any object in the poly patcher that is contained in the Objs dict
function make_obj_getter(part, obj)
{
	if(part.obj[obj.Name].understands('getvalueof'))
	{
		var getter = function()
		{
			part[obj.Name] = part.obj[obj.Name].getvalueof();
		}
	}
	else
	{
		var getter = function()
		{
			return;
		}
	}
	return getter;
}

//make a closure to hold a callback from pattrstorage to use when requesting unloaded preset data for editing in TR256
//since this is the only place we use this call, we can directly forward the data to the grid
function make_pset_edit_input(num)
{
	var pset_edit_input = function()
	{
		var args = arrayfromargs(arguments);
		part[num].edit_buffer = args;
		//post('received input', num, args);
		//var x=(args.length-1);do{
		//	mod.Send( 'grid', x, num+2, args[x]);
		//}while(x--);
	}
	return pset_edit_input
}

//make a closure to hold a callback from pattrstorage to use when requesting unloaded preset data for editing in TR256
//since this is the only place we use this call, we can directly forward the data to the grid
function make_tvel_edit_input(num)
{
	var pset_tvel_input = function()
	{
		var args = arrayfromargs(arguments);
		//post('received velocities', num, args);
		var x=(args.length-1);do{
			mod.Send( 'grid', 'value', x, num+2, part[num].edit_buffer[x]*ACCENTS[Math.floor(args[x]/8)]);
		}while(x--);
	}
	return pset_tvel_input
}

//dummy callback to compensate for api bug in Max6
function callback()
{
	//debug('callback', arguments);
}

//called by init to initialize state of polys
function init_poly()
{
	//poly.message('target', 0);
	mod.Send( 'batch', 'c_grid', 0);
	grid_out('batch', 'grid', 0);
	for(var i=0;i<16;i++)
	{
		part[i].obj.quantize.message('int', part[i].quantize);
		part[i].obj.active.message('int', part[i].active);
		part[i].obj.swing.message('float', part[i].swing);
		part[i].obj.ticks.message(part[i].ticks);
		//part[i].obj.phasor.lock = 1;
		part[i].obj.polyenable.message('int', part[i].polyenable);
		//part[i].obj.phasor.message('float', 0);
		part[i].obj.noteoffset.message('int', (part[i].octave *12) + part[i].root);
		part[i].obj.pattern.message('list', part[i].pattern);
		part[i].obj.note.message('list', part[i].note);
		part[i].obj.velocity.message('list', part[i].velocity);
		part[i].obj.duration.message('list', part[i].duration);
		part[i].obj.notetype.message('int', part[i].notetype);
		part[i].obj.notevalues.message('int', part[i].notevalues);
		part[i].obj.channel.message('int', part[i].channel);
		part[i].obj.behavior_enable.message('int', part[i].behavior_enable);
		part[i].obj.multiplier.message('float', part[i].multiplier)
		//update_note_pattr(part[i]);

	}
}

//called by init to initialize state of gui objects
function _clear_surface()
{
	debug('clear_surface');
	stepmodegui.message('int', 0);
}

//should be called on freebang, currently not implemented
function _dissolve()
{
	for(var i in script)
	{
		if((/^_/).test(i))
		{
			post('replacing', i);
			script[i.replace('_', "")] = script['anything'];
		}
	}
	Alive=0;
	post('Hex dissolved.');
}

///////////////////////////
/*	 display routines	 */
///////////////////////////

function setup_translations()
{
	//Notes
	/*Here we set up some translation assignments and send them to the Python ModClient.
	Each translation add_translation assignment has a name, a target, a group, and possibly some arguments.
	Translations can be enabled individually using their name/target combinations, or an entire group can be enabled en masse.
	There are not currently provisions to dynamically change translations or group assignments once they are made.*/

	/*Batch translations can be handled by creating alias controls with initial arguments so that when the batch command is sent
	the argument(s) precede the values being sent.	They are treated the same as the rest of the group regarding their
	enabled state, and calls will be ignored to them when they are disabled.  Thus, to send a column command to an address:
	'add_translation', 'alias_name', 'address', 'target_group', n.
	Then, to invoke this translation, we'd call:
	'receive_translation', 'alias_name', 'column', nn.
	This would cause all leds on the column[n] to be lit with color[nn].

	It's important to note that using batch_row/column calls will wrap to the next column/row, whereas column/row commands will
	only effect their actual physical row on the controller.*/

	//CNTRLR stuff:
	for(var i = 0;i < 16;i++)
	{
		mod.Send( 'add_translation', 'pads_'+i, 'po10_grid', 'cntrlr_pads', i%4, Math.floor(i/4));
		mod.Send( 'add_translation', 'keys_'+i, 'po10_key', 'po10_keys', i, 0);
		mod.Send( 'add_translation', 'keys2_'+i, 'po10_key', 'po10_keys2', i, 1);
	}
	mod.Send( 'add_translation', 'pads_batch', 'po10_grid', 'cntrlr_pads', 0);
	mod.Send( 'add_translation', 'keys_batch', 'po10_key', 'po10_keys', 0);
	mod.Send( 'add_translation', 'keys_batch_fold', 'po10_key', 'po10_keys', 0, 16);
	mod.Send( 'add_translation', 'keys2_batch', 'po10_key', 'po10_keys2', 1);
	mod.Send( 'add_translation', 'keys2_batch_fold', 'po10_key', 'po10_keys', 1, 16);
	for(var i=0;i<8;i++)
	{
		mod.Send( 'add_translation', 'buttons_'+i, 'po10_encoder_button_grid', 'po10_buttons', i);
		mod.Send( 'add_translation', 'extras_'+i, 'po10_encoder_button_grid', 'po10_extras', i);
	}
	mod.Send( 'add_translation', 'buttons_batch', 'po10_encoder_button_grid', 'po10_buttons');
	mod.Send( 'add_translation', 'extras_batch', 'po10_encoder_button_grid', 'po10_extras');

}

function setup_colors()
{
	mod.Send( 'fill_color_map', 'Monochrome', 1, 1, 1, 1, 8, 1, 1, 16);
}

function refresh_pads()
{
	debug('refresh_pads');
	switch(pad_mode)
	{
		case 0:
			var i=3;do{
				var j=3;do{
					var v = SelectColors[Math.floor(i+(j*4) == selected.num)];
					if(grid_mode == 0){ mod.Send( 'receive_translation', 'pads_'+(i+(j*4)), 'value', v);}
					padgui.message(i, j, v);
				}while(j--);
			}while(i--);
			break;
		case 1:
			var i=3;do{
				var j=3;do{
					var v = AddColors[Math.floor(i+(j*4) == selected.num)];
					if(grid_mode == 0){ mod.Send( 'receive_translation', 'pads_'+(i+(j*4)), 'value', v);}
					padgui.message(i, j, v);
				}while(j--);
			}while(i--);
			break;
		case 2:
			var i=15;do{
				var v = part[i].active*2;
				if(grid_mode == 0){ mod.Send( 'receive_translation', 'pads_'+i, 'value', v);}
				padgui.message(i%4, Math.floor(i/4), v);
			}while(i--);
			break;
		case 3:
			var p = presets[selected.num]-1;
			var i=15;do{
				var v = (i==p)+3;
				if(grid_mode == 0){ mod.Send( 'receive_translation', 'pads_'+i, 'value', v);}
				//mod.Send( 'receive_translation', 'pads_'+i, 'value', v);
				padgui.message(i%4, Math.floor(i/4), v);
			}while(i--);
			break;
		case 4:
			var p = presets[selected.num]-1;
			var i=15;do{
				var v = (i==p)+6;
				if(grid_mode == 0){
					mod.Send( 'receive_translation', 'pads_'+i, 'value', -1);
					mod.Send( 'receive_translation', 'pads_'+i, 'value', v);
				}
				padgui.message(i%4, Math.floor(i/4), v);
			}while(i--);
			break;
		case 6:
			var i=15;do{
				var v=(selected.triggered.indexOf(i)>-1) + 7;
				if(grid_mode == 0){ mod.Send( 'receive_translation', 'pads_'+i, 'value', v);}
				padgui.message(i%4, Math.floor(i/4), v);
			}while(i--);
			break;
		case 7:
			var i=15;do{
				var v=(selected.triggered.indexOf(i)>-1) + 7;
				if(grid_mode == 0){ mod.Send( 'receive_tranlsation', 'pads_'+i, 'value', v);}
				padgui.message(i%4, Math.floor(i/4), v);
			}while(i--);
			break;
		default:
			if(selected.num<8)
			{
				var i=3;do{
					var j=3;do{
						var v = SelectColors[Math.floor(i+(j*4) == selected.num)+((j<2)*2)];
						if(grid_mode == 0){ mod.Send( 'receive_translation', 'pads_'+(i+(j*4)), 'value', v);}
						padgui.message(i, j, v);
					}while(j--);
				}while(i--);
			}
			else
			{
				var i=3;do{
					var j=3;do{
						var v = SelectColors[Math.floor(i+(j*4) == selected.num)+((j>1)*2)];
						if(grid_mode == 0){ mod.Send( 'receive_translation', 'pads_'+(i+(j*4)), 'value', v);}
						padgui.message(i, j, v);
					}while(j--);
				}while(i--);
			}
			break;
	}
}

function refresh_c_keys()
{
	var pattern = [];
	var i = 15;do{
		pattern.unshift(selected.pattern[i] * StepColors[i]);
	}while(i--);
	if(grid_mode == 0){ mod.Send( 'receive_translation', 'keys2_batch_fold', 'batch_row_fold', pattern);}
	var batch = [];
	switch(key_mode)
	{
		case 1:
			var i=15;do{
				var v = (i>=part[selected.num].nudge&&i<=(part[selected.num].nudge+part[selected.num].steps))*5;
				keygui.message(i, 0, v);
				batch.unshift(v);
			}while(i--);
			if(grid_mode == 0){
				mod.Send( 'receive_translation', 'keys_batch', 'batch_mask_row', -1);
				mod.Send( 'receive_translation', 'keys_batch_fold', 'batch_row_fold', batch);
			}
			break;
		case 2:
			var i=15;do{
				batch.unshift(Colors[part[selected.num].behavior[i]]);
				keygui.message(i, 0, selected.behavior[i]+8);
			}while(i--);
			if(grid_mode == 0){
				mod.Send( 'receive_translation', 'keys_batch', 'batch_mask_row', -1);
				mod.Send( 'receive_translation', 'keys_batch_fold', 'batch_row_fold', batch);
			}
			break;
		case 3:
			var p = presets[selected.num]-1;
			var i=15;do{
				var v = (i==p)+3;
				batch.unshift(v);
				keygui.message(i, 0, v);
			}while(i--);
			if(grid_mode == 0){
				mod.Send( 'receive_translation', 'keys_batch', 'batch_mask_row', -1);
				mod.Send( 'receive_translation', 'keys_batch_fold', 'batch_row_fold', batch);
			}
			break;
		case 4:
			var p = presets[selected.num]-1;
			var i=15;do{
				var v = (i==p)+6;
				batch.unshift(v);
				keygui.message(i, 0, v);
			}while(i--);
			if(grid_mode == 0){
				mod.Send( 'receive_translation', 'keys_batch', 'batch_mask_row', -1);
				mod.Send( 'receive_translation', 'keys_batch_fold', 'batch_row_fold', batch);
			}
			break;
		case 5:
			var i=15;do{
				batch.unshift(4);
				keygui.message(i, 0, 4);
			}while(i--);
			if(grid_mode == 0){
				mod.Send( 'receive_translation', 'keys_batch', 'batch_mask_row', -1);
				mod.Send( 'receive_translation', 'keys_batch_fold', 'batch_row_fold', batch);
				mod.Send( 'receive_translation', 'keys_'+i, 'mask', selected.note[current_step], 5);
			}
			break;
		case 6:
			var i=15;do{
				var v=(selected.triggered.indexOf(i)>-1) + 7;
				batch.unshift(v);
				keygui.message(i, 0, v);
			}while(i--);
			if(grid_mode == 0){ mod.Send( 'receive_translation', 'keys_batch_fold', 'batch_row_fold', batch);}
			break;
		case 7:
			var i=15;do{
				var v = ACCENTS[Math.floor(selected.velocity[i]/8)];
				batch.unshift(v);
				keygui.message(i, 0, v);
			}while(i--);
			if(grid_mode == 0){ mod.Send( 'receive_translation', 'keys_batch_fold', 'batch_row_fold', batch);}
			break;
		case 8:
			var p = presets[selected.num]-1;
			var muted = this.patcher.getnamed('moddial').getvalueof() == 0;
			debug('muted:', muted);
			//a bit convoluted:  batch goes out to controller, and first part of batch is sent to keygui, but second half of
			//key gui is rendered directly since it's different from the values sent to the non-rgb controller buttons
			batch.unshift(8);
			batch.unshift(2);
			batch.unshift(muted ? 5 : 1);
			batch.unshift(0);
			batch.unshift(0);
			batch.unshift(0);
			batch.unshift(0);
			batch.unshift(bitcrusherOnOff_value ? 5 : 1);
			keygui.message(15, 0, 5);
			keygui.message(14, 0, 2);
			keygui.message(13, 0, muted ? 4 : 3);
			keygui.message(12, 0, 4);
			keygui.message(11, 0, 7);
			keygui.message(10, 0, 7);
			keygui.message(9, 0, 4);
			keygui.message(8, 0, bitcrusherOnOff_value ? 10 : 2);
			/*var i=4;do{
				var v = (i==p)+6;
				batch.unshift(Math.floor(i==p));
				keygui.message(i+8, 0, v);
			}while(i--);*/
			var i=7;do{
				var v = (i==Math.floor((global_offset)/16));
				//debug('new offset:', global_offset, v, i, Math.floor((global_offset)/16));
				batch.unshift(Math.floor(v));
				keygui.message(i, 0, v);
			}while(i--);
			if(grid_mode == 0){
				mod.Send( 'receive_translation', 'keys_batch', 'batch_mask_row', -1);
				//debug('batch is:', batch);
				mod.Send( 'receive_translation', 'keys_batch_fold', 'batch_row_fold', batch);
			}
			//keygui.message(8, 0, bitcrusherOnOff_value ? 4 : 0);
			//debug('sending to bitcrusherOnOff:', bitcrusherOnOff_value ? 4 : 0)
			break;
		default:
			var i=15;do{
				var v = part[i].active*2;
				batch.unshift(v);
				keygui.message(i, 0, v);
				pattern.push(selected.pattern[i] * StepColors[i]);
			}while(i--);
			if(grid_mode == 0){ mod.Send( 'receive_translation', 'keys_batch_fold', 'batch_row_fold', batch);}
			break;
	}
}

function refresh_grid()
{
	//debug('refresh_grid');
	switch(grid_mode)
	{
		default:
			//cntrlr_emu_mode
			refresh_pads();
			refresh_c_keys();
			var i=7;do{
				mod.Send( 'receive_translation', 'buttons_'+i, 'value', ENC_COLORS[i]);
			}while(i--);
			refresh_extras();
			break;
		case 1:
			//TR256_mode
			var i=15;do{
				mod.Send( 'grid', 'value', i, 0, ((preset-1)==i)*((4*rec_enabled)+1));
				mod.Send( 'grid', 'value', i, 1, ((edit_preset-1)==i)*((4*rec_enabled)+1));
			}while(i--);
			break;
		case 2:
			//Poly_Rec_mode
			mod.Send( 'grid', 'value', 0, 0, selected.hold*7);
			//mod.Send( 'grid', 'value',0, 15, selected.hold*7);
			//mod.Send( 'grid', 'value',15, 0, selected.hold*7);
			//mod.Send( 'grid', 'value',15, 15, selected.hold*7);
			var i=7;do{
				mod.Send( 'grid', 'value', i+1, 0, presets[selected.num] == i+1 ? 1 : 0);
			}while(i--);
			break;
		case 3:
			//Cafe_Play_mode
			break;
		case 4:
			//Boiingg_Play_mode
			break;
		case 5:
			break;
		case 6:
			//Preset_Mode
			break;
		case 7:
			//Behavior_Grid_mode
			var i=7;do{
				var j=6;do{
					mod.Send( 'grid', 'value', j, i, BEHAVE_COLORS[behavegraph[j][i]]);
				}while(j--);
			}while(i--);
			var i=6;do{
					mod.Send( 'grid', 'value', 7, i, BEHAVE_COLORS[i] * Math.floor(i==current_rule));
			}while(i--);
			break;
	}
}

function refresh_keys()
{
	if(!alt)
	{
		var x=7;do{
			mod.Send( 'key', 'value', x, (x==grid_mode)*8);
		}while(x--);
	}
	else
	{
		var i=3;do{
			mod.Send( 'key', 'value', i, (i==(Tvel))*(TVEL_COLORS[i]));
		}while(i--);
	}
}

function refresh_extras()
{
	if(grid_mode == 0){
		var i=7;do{
			mod.Send( 'receive_translation', 'extras_'+i, 'value', MODE_COLORS[i]+(7*(i==key_mode)));
		}while(i--);
	}
}

function grid_out(){}

function base_grid_out(){}

/*/////////////////////////////////
///// api callbacks and input /////
/////////////////////////////////*/

//catch old calls that should be changed
function grid_in(x, y, val)
{
	debug('grid in: shouldnt happen::', x, y, val);
}
function key_in(num, val)
{
	debug('key in: shouldnt happen::', num, val);
}
function button_in(x, y, val)
{
	debug('button in: shouldnt happen::', x, y, val);
}

//main input sorter for calls from mod.js
function anything()
{
	var args = arrayfromargs(arguments);
	if(DEBUGANYTHING){post('anything', messagename, arguments);}
	switch(messagename)
	{
		case 'settingsgui':
			switch(args[0])
			{
				case 0:
					pad_invoked_key_mode = args[1];
					break;
				case 1:
					timing_immediate = args[1];
					break;
				case 2:
					global_chain_offset = args[1];
					break;
				case 4:
					transpose_steps = args[1];
					break;
				case 14:
					vals = args.slice(1, 9);
					keymodeenables = [];
					for(var i=0;i<8;i++)
					{
						if(vals[i])
						{
							keymodeenables.push(i);
						}
					}
					debug('keymodeenables', keymodeenables);
					break;
				case 15:
					vals = args.slice(1, 8);
					padmodeenables = args.slice(1, 8);
					padmodeenables = [];
					for(var i=0;i<7;i++)
					{
						if(vals[i])
						{
							padmodeenables.push(i);
						}
					}
					debug('padmodeenables', padmodeenables);
					break;
			}
			break;
		case 'guibuttons':
			switch(args[0])
			{
				case 10:
					pad_mode = args[1];
					break;
				case 11:
					key_mode = args[1];
					break;
				case 12:
					global_offset = (Math.max(Math.min(args[1], 96), 0));
					break;
				case 14:
					locked = args[1];
					break;
			}
			break;
		default:
			debug('anything', messagename, args);
			break;
	}
}

var _po10_encoder_button_grid = _c_button;

function _c_button(x, y, val)
{
	debug('_c_button_in', x, y, val);
	switch(y)
	{
		case 0:
			switch(x)
			{
				case 0:
					break;
				case 1:
					break;
				case 2:
					break;
				case 3:
					break;
			}
			break;
		case 1:
			switch(x)
			{
				case 0:
					break;
				case 1:
					break;
				case 2:
					if(val>0){
						//selected.obj.set.random(0);
						//Random.message('set', selected.obj.random.getvalueof());
						Random.message('float', 0);
					}
					break;
				case 3:
					if(val>0){
						//selected.obj.set.groove(.5);
						//Groove.message('set', selected.obj.groove.getvalueof());
						Groove.message('float', .5);
					}
					break;
			}
			break;
	}
}

function _c_button(x, y, val)
{
	debug('_c_button', x, y, val);
	if(val)
	{
		switch(x)
		{
			case 0:
				//set_mod_parameter_to_default(0);
				set_speed(selected.num, 4);
				Speed.message('int', 4);
				break;
			case 1:
				//mod.Send( 'send_explicit', 'receive_device', 'set_param_to_default', 'id', custom_device_ids[1], 0);
				set_custom_parameter_to_default(1);
				break;
			case 2:
				//mod.Send( 'send_explicit', 'receive_device', 'set_param_to_default', 'id', custom_device_ids[2], 0);
				set_custom_parameter_to_default(2);
				break;
			case 3:
				//mod.Send( 'send_explicit', 'receive_device', 'set_param_to_default', 'id', custom_device_ids[3], 0);
				set_custom_parameter_to_default(3);
				break;
			case 4:
				//set_mod_parameter_to_default(4);
				this.patcher.getnamed('moddial').message('int', 127);
				break;
			case 5:
				set_mod_parameter_to_default(5);
				break;
			case 6:
				set_mod_parameter_to_default(6);
				break;
			case 7:
				//set_mod_parameter_to_default(7);
				part[selected.num].obj.multiplier.message('float', 1);
				Multiplier.message('float', 1);
				break;
			default:
				break;
		}
	}
}

var _po10_key = _c_key;

function _c_key(x, y, val)
{
	debug('c key in', x, y, val);
	num = (x + (y*16));
	if((y==1)&&(val>0))
	{
		num -= 16;;
		debug('pattern is:', selected.pattern, 'num is:', num);
		selected.pattern[num] = Math.abs(selected.pattern[num]-1);
		debug('pattern is:', selected.pattern);
		selected.obj.set.pattern(selected.pattern);
		if((edit_preset == presets[selected.num])&&(grid_mode==1))
		{
			storage.getstoredvalue('poly.'+(selected.num+1)+'::pattern', edit_preset);
		}
		step.message('extra1', 1, selected.pattern);
		step.message('zoom', 1, 1);
		refresh_c_keys();
		refresh_grid();
		mod.Send( 'cntrlr_encoder_grid', 'custom', selected.num%4, Math.floor(selected.num/4)%2, selected.pattern);
		//mod.Send( 'to_c_wheel', selected.num%4, Math.floor(selected.num/4)%2, 'custom', 'x'+(selected.pattern.join('')));
	}
	else
	{
		switch(key_mode)
		{
			//mute mode
			default:
				if(val>0)
				{
					var Part = part[num];
					//part[num].active = Math.abs(part[num].active-1);
					Part.obj.set.active(Math.abs(Part.active-1));
					refresh_c_keys();
					if(pad_mode==2){refresh_pads();}
					refresh_grid();
					add_automation(Part, 'mute', Part.active);
				}
				break;
			//loop mode
			case 1:
				if((key_pressed == num)&&(val==0))
				{
					key_pressed = -1;
				}
				if((key_pressed < 0)&&(val>0)&&(num>=selected.nudge))
				{
					key_pressed = num;
					change_Out(num);
					//step.message('loop', parseInt(selected.nudge+1), parseInt(key_pressed+1));
				}
				else if((key_pressed > -1)&&(val>0)&&(num<=key_pressed))
				{
					change_In(num);
					//step.message('loop', num, parseInt(key_pressed+1))
				}
				update_step();
				refresh_c_keys();
				break;
			//behavior mode
			case 2:
				if(val>0)
				{
					selected.behavior[num] = (selected.behavior[num]+1)%8;
					part[selected.num].obj.set.behavior(selected.behavior);
					update_step();
					refresh_c_keys();
					break;
				}
			//preset mode
			case 3:
				if((val>0)&&(key_pressed<0))
				{
					key_pressed = num;
					if(val>0)
					{
						presets[selected.num] = num+1;
						storage.message('recall', 'poly.'+(selected.num+1), presets[selected.num]);
						add_automation(selected, 'preset', presets[selected.num]);
					}
				}
				else if(val>0)
				{
					key_pressed = -1;
					copy_preset(selected, num+1);
				}
				else
				{
					key_pressed = -1;
				}
				break;
			//global mode
			case 4:
				if((val>0)&&(pad_pressed<0))
				{
					key_pressed = num;
					if(val>0)
					{
						for(var i=0;i<16;i++)
						{
							presets[i] = num+1;
						}
						preset = num+1;
						storage.message(presets[selected.num]);
					}
				}
				else if(val>0)
				{
					key_pressed = -1;
					copy_global_preset(preset, num+1);
				}
				else
				{
					key_pressed = -1;
				}
				break;
			//polyrec mode
			case 5:
				if(val>0)
				{
					selected.note[current_step] = num;
					selected.obj.set.note(selected.note);
					step.message('pitch', 1, selected.note);
					selected.pattern[current_step] = 1;
					selected.obj.set.pattern(selected.pattern);
					selected.obj.last_trigger.message('bang');
					step.message('extra1', 1, selected.pattern);
					step.message('zoom', 0, 16);
					refresh_c_keys();
				}
				break;
			//polyplay mode
			case 6:
				play_sequence(selected, num, val);
				refresh_c_keys();
				break;
			//accent mode
			case 7:
				if(val>0)
				{
					selected.velocity[num] = ACCENT_VALS[(ACCENTS[Math.floor(selected.velocity[num]/8)])%4];
					//post('vel:', selected.velocity[num], 'calc:', (Math.floor(selected.velocity[num]/8)));
					selected.obj.set.velocity(selected.velocity);
					refresh_c_keys();
				}
				break;
			case 8:
				if(num<8)
				{
					if(val>0)
					{
						change_transpose(16*num);
						refresh_c_keys();
					}
				}
				/*else if(num<13)
				{
					if((val>0)&&(pad_pressed<0))
					{
						key_pressed = num-8;
						if(val>0)
						{
							for(var i=0;i<16;i++)
							{
								presets[i] = num-7;
							}
							preset = num-7;
							storage.message(presets[selected.num]);
						}
					}
					else if(val>0)
					{
						key_pressed = -1;
						copy_global_preset(preset, num-7);
					}
					else
					{
						key_pressed = -1;
					}
					break;
				}*/
				else if(val>0)
				{
					//N24
					if(num==8)
					{
						//reverse_all_samples()
						toggle_bitcrusher();
					}
					//N25
					else if(num==9)
					{
						//FOCUS ON FIRST INSERT
					}
					//N26
					else if(num==10)
					{
						//FOCUS ON SECOND INSERT
					}
					//N27
					else if(num==11)
					{
						//FOCUS ON THIRD INSERT
					}
					//N28
					else if(num==12)
					{

					}
					//N29
					else if(num==13)
					{
						resync();
						this.patcher.getnamed('moddial').message('int', 127);
						refresh_c_keys();
					}
					//N30
					else if(num==14)
					{
						_reset_params_to_default();
						reset_multipliers();
						reset_speeds();
					}
					//N31
					else if(num==15)
					{
						this.patcher.getnamed('moddial').message('int', 0);
						clear_pattern(selected);
						_reset_params_to_default();
						//select_pattern(selected.num);
						reset_multipliers();
						reset_speeds();
						resync();
						this.patcher.getnamed('moddial').message('int', 127);
					}
				}
		}
	}
}

var _po10_grid = _c_grid;

function _c_grid(x, y, val)
{
	debug('_c_grid', x, y, val);
	switch(pad_mode)
	{
		//select mode
		default:
			if((val>0)&&(pad_pressed<0))
			{
				pad_pressed = x + (y*4);
				select_pattern(pad_pressed);
				last_key_mode = key_mode;
				pipe.message('int', pad_pressed);
			}
			else if((x + (y*4) == pad_pressed)&&(val<1))
			{
				pad_pressed = -1;
				change_key_mode(last_key_mode);
			}
			else
			{
				copy_pattern(selected, part[x + (y*4)]);
			}
			break;
		//add mode
		case 1:
			if(val>0)
			{
				var p = x+(y*4);
				add_note(part[p]);
				/*if(p != selected.num)
				{
					select_pattern(p);
				}
			}
			else if((x + (y*4) == pad_pressed)&&(val<1))
			{
				pad_pressed = -1;
				change_key_mode(last_key_mode);*/
			}
			break;
		//mute mode
		case 2:
			if(val>0)
			{
				var Part = part[x + (y*4)];
				Part.obj.set.active(Math.abs(Part.active-1));
				refresh_pads();
				if(key_mode==0){refresh_c_keys();}
				add_automation(Part, 'mute', Part.active);
			}
			break;
		//preset mode
		case 3:
			debug('pad_pressed', pad_pressed);
			if((val>0)&&(pad_pressed<0))
			{
				pad_pressed = x + (y*4);
				var num = x + (y*4);
				if(val>0)
				{
					presets[selected.num] = num+1;
					storage.message('recall', 'poly.'+(selected.num+1), presets[selected.num]);
					add_automation(selected, 'preset', presets[selected.num]);
				}
			}
			else if(val>0)
			{
				pad_pressed = -1;
				copy_preset(selected, x+(y*4)+1);
			}
			else
			{
				pad_pressed = -1;
			}
			break;
		//global mode
		case 4:
			if((val>0)&&(pad_pressed<0))
			{
				pad_pressed = x + (y*4);
				var num = x + (y*4);
				if(val>0)
				{
					for(var i=0;i<16;i++)
					{
						presets[i] = num+1;
					}
					preset = num+1;
					storage.message(presets[selected.num]);
				}
			}
			else if(val > 0)
			{
				pad_pressed = -1;
				copy_global_preset(preset, x+(y*4)+1);
			}
			else
			{
				pad_pressed = -1;
			}
			break;
		//freewheel mode
		case 5:
			if((val>0)&&(pad_pressed<0))
			{
				pad_pressed = x + (y*4);
				select_pattern(pad_pressed);
				last_key_mode = key_mode;
				pipe.message('int', pad_pressed);
			}
			else if((x + (y*4) == pad_pressed)&&(val<1))
			{
				pad_pressed = -1;
				change_key_mode(last_key_mode);
			}
			else
			{
				sync_wheels(selected, part[x + (y*4)]);
			}
			break;
		//play mode
		case 6:
			if(val>0)
			{
				var p = x+(y*4);
				play_note(part[p]);

			}
			break;
		//polyplay mode
		case 7:
			//post('pad_play', x, y, val);
			var num = x + (y*4);
			if(val>0)
			{
				var trig = selected.triggered.indexOf(num);
				if(trig == -1)
				{
					selected.triggered.push(num);
					selected.obj.polyplay.message('midinote', num, val);
				}
				else
				{
					var held = selected.held.indexOf(num);
					if(held > -1)
					{
						//remove from the held array since a new sequence has been triggered
						selected.held.splice(held, 1);
					}
				}
			}
			else
			{
				if(selected.hold == 0)
				{
					var trig = selected.triggered.indexOf(num);
					if(trig > -1)
					{
						selected.triggered.splice(trig, 1);
					}
					selected.obj.polyplay.message('midinote', num, val);
				}
				else
				{
					//add to the held array, so that when hold for part is turned off the note can be flushed
					selected.held.push(num);
				}
			}
			//part[num].obj.polyenable.message('int', part[num].polyenable);
			refresh_pads();
			break;
	}
}

function _grid(x, y, val)
{
	debug('_grid', x, y, val);
	switch(grid_mode)
	{
		default:
			if(y<2)
			{
				_c_grid(x%4, Math.floor(x/4)+(y*2), val);
			}
			else if (y<4)
			{
				_c_key(x + 8*(y-2), 0, val);
			}
			else if (y<6)
			{
				_c_key(x + 8*(y-4), 1, val);
			}
			else if (y==6)
			{
				_c_button(x%4, Math.floor(x/4), val);
			}
			else if ((y==7)&&(val))
			{
				keymodegui.message('int', x);
			}
			break;
		case 1:
			if(val>0)
			{
				switch(y)
				{
					case 0:
						if(grid_pressed<0)
						{
							if(rec_enabled)
							{
								set_record(0);
							}
							else
							{
								grid_pressed = x + (y*16);
								preset = x+1;
								var i=15;do{
									presets[i] = x+1;
								}while(i--);
								storage.message(preset);
								refresh_grid();
							}
							break;
						}
						else
						{
							copy_global_preset(x+(y*16)+1);
							grid_pressed = -1;
						}
						break;
					case 1:
						if(rec_enabled)
						{
							set_record(0);
						}
						if(grid_pressed<0)
						{
							edit_preset = x+1;
							var y=13;do{
								storage.getstoredvalue('poly.'+y+'::pattern', edit_preset);
								storage.getstoredvalue('poly.'+y+'::velocity', edit_preset);
							}while(y--);
						}
						else if(grid_pressed==x)
						{
							set_record(1);
						}
						refresh_grid();
						break;
					default:
						var Part = part[y-2], cur_step = Part.edit_buffer[x],
							cur_vel = Part.edit_velocity[x], new_vel = ACCENT_VALS[Tvel];
						if((cur_step)&&(cur_vel!=new_vel))
						{
							cur_vel=new_vel;
						}
						else if(cur_step)
						{
							cur_step = 0;
						}
						else
						{
							cur_step = 1;
							cur_vel = new_vel;
						}
						Part.edit_buffer[x]=cur_step;
						Part.edit_velocity[x]=cur_vel;
						if(altVal)
						{
							var quad = (x+8)%16;
							Part.edit_buffer[quad] = cur_step;
							Part.edit_velocity[quad] = ACCENT_VALS[Tvel];
						}
						if(edit_preset!=preset)
						{
							//don't send to objects since this is for a non-loaded preset
							Part.obj.set.pattern(Part.edit_buffer, edit_preset);
							if(cur_step>0)
							{
								Part.obj.set.velocity(Part.edit_velocity, edit_preset);
							}
						}
						else
						{
							Part.obj.set.pattern(Part.edit_buffer);
							Part.obj.set.velocity(Part.edit_velocity);
							if(Part == selected)
							{
								step.message('velocity', 1, selected.velocity);
								step.message('extra1', 1, selected.pattern);
								step.message('zoom', 1, 1);
								refresh_c_keys();
								mod.Send( 'cntrlr_encoder_grid', 'custom', part[y-2].num%4, Math.floor(part[y-2].num/4)%2, part[y-2].pattern);
							}
						}
						mod.Send( 'grid', 'value', x, y, part[y-2].edit_buffer[x]*(ACCENTS[Math.floor(part[y-2].edit_velocity[x]/8)]));
						//refresh_grid();
						break;
				}
			}
			else if((x + (y*16) == grid_pressed)&&(val<1))
			{
				grid_pressed = -1;
			}
			break;
		case 2:
			if(altVal>0)
			{
				//Poly_Record_mode
				if(((x==0)&&(y==0))||((x==15)&&(y==0))||((x==15)&&(y==15))||((x==0)&&(y==15)))
				{
					if(val>0)
					{
						poly_hold_toggle();
						refresh_grid();
					}
				}
				else if((y==0)&&(val>0))
				{
					presets[selected.num] = x;
					storage.message('recall', 'poly.'+(selected.num+1), presets[selected.num]);
					refresh_grid();
				}
				else if(val>0)
				{
					y -= 1;
					var note = (x<<6) + (y<<10) + 32;
					debug('new note', current_step, x, y, note);
					debug('decoded:', (note>>6)%16, note>>10);
					if(selected.note[0]<32)
					{
						selected.obj.offset.message('int', 0);
						curSteps[selected.num]=0;
					}
					selected.note[curSteps[selected.num]] = note;
					selected.obj.set.note(selected.note);
					debug('new notes:', selected.obj.note.getvalueof());
					step.message('pitch', 1, selected.note);
					selected.pattern[curSteps[selected.num]] = 1;
					selected.obj.set.pattern(selected.pattern);
					selected.obj.last_trigger.message('bang');
					step.message('extra1', 1, selected.pattern);
					step.message('zoom', 0, 16);
					refresh_c_keys();
				}
			}
			else
			{
				//Poly_Play_mode
				if(((x==0)&&(y==0))||((x==15)&&(y==0))||((x==15)&&(y==15))||((x==0)&&(y==15)))
				{
					if(val>0)
					{
						poly_hold_toggle();
						refresh_grid();
					}
				}
				else if((y==0)&&(val>0))
				{
					presets[selected.num] = x;
					storage.message('recall', 'poly.'+(selected.num+1), presets[selected.num]);
					refresh_grid();
				}
				else
				{
					y -= 1;
					var root = selected.obj.note.getvalueof()[0];
					//play_sequence(selected, ((x-(root>>6)%16)<<6) + (y-(root>>10)<<10) + 32, val);
					play_sequence(selected, (x<<6) + (y<<10) + 32, val);
					refresh_c_keys();
					refresh_grid();
				}
			}
			break;
		case 3:
			//Cafe_Play_mode
			debug('cafe play', presets[x]);
			var Part = part[y];
			if(((x+1)==presets[y])&&(val==0)&&(altVal==0))
			{
				Part.obj.set.clutch(0);
				var i=15;do{
					mod.Send( 'grid', 'value', i, y, 0);
				}while(i--);
			}
			else if(val>0)
			{
				if((x+1)!=presets[y])
				{
					presets[y] = x+1;
					storage.message('recall', 'poly.'+(y+1), presets[y]);
					Part.pattern = Part.obj.pattern.getvalueof();
				}
				Part.obj.restartcount.message(0);
				Part.obj.set.clutch(1);
			}
			break;
		case 4:
			//Boiingg_Play_mode
			if(val>0)
			{
				if(altVal>0)
				{
					switch(y)
					{
						case 0:
							timeupgui.message('int', val);
							break;
						case 1:
							timedngui.message('int', val);
							break;
					}
				}
				else
				{
					if(y>0)
					{
						var pset = presets[x];
						var Part = part[x];
						if(Part.direction!=2){
							Part.obj.set.direction(2);
						}
						if(Part.nudge!=0){
							Part.obj.set.nudge(0);
						}
						if(Part.pattern.join('')!='1000000000000000'){
							Part.obj.set.pattern([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
						}
						Part.obj.restartcount.message(0);
						Part.obj.set.steps(y);
					}
					else
					{
						mod.Send( 'grid', 'mask_column', x, -1);
					}
					if(part[x].active!=(y>0)){
						part[x].obj.set.active(y>0);
					}
					if(part[x]==selected)
					{
						refresh_c_keys();
						if(pad_mode==2){refresh_pads();}
						update_gui();
					}
				}
			}
			break;
		case 5:
			//Slider Mode
			break;
		case 6:
			//Preset_Mode
			break;
		case 7:
			//Behavior_Grid_mode
			if((val>0)&&(x<7))
			{
				if(current_rule == 0)
				{
					rulemap.message('list', x, y, (behavegraph[x][y]+1)%7);
				}
				else
				{
					rulemap.message('list', x, y, current_rule);
				}
			}
			else if((val>0)&&(x==7))
			{
				current_rule = y;
				refresh_grid();
			}
			break;

	}
}

function _base_grid(x, y, val)
{
	debug('_base_grid', x, y, val);
	if(shifted)
	{
		if(y<2)
		{
			_c_key(x + 8*(y), 0, val);
		}
		else if(y<3)
		{
			_c_button(x%4, Math.floor(x/4), val);
		}
		else if((y==3)&&(val>0))
		{
			keymodegui.message('int', x);
		}
	}
	else if (y<2)
	{
		_c_grid(x%4, Math.floor(x/4)+(y*2), val);
	}
	else if (y<4)
	{
		_c_key(x + 8*(y-2), 1, val);
	}
}

function _code_grid(x, y, val)
{
	_base_grid(x, y, val);
}

function _push_grid(x, y, val)
{
	debug('push_grid', x, y, val);
	_grid(x, y, val);
}

function _shift(val)
{
	debug('shift:', val);
	if(val!=shifted)
	{
		shifted = val;
		mod.Send( 'enable_translation_group', 'base_keys', Math.floor(shifted));
		mod.Send( 'enable_translation_group', 'base_pads', Math.floor(!shifted));
		mod.Send( 'enable_translation_group', 'base_keys2', Math.floor(!shifted));
		mod.Send( 'enable_translation_group', 'base_buttons',  Math.floor(shifted));
		mod.Send( 'enable_translation_group', 'base_extras',  Math.floor(shifted));

		mod.Send( 'enable_translation_group', 'code_keys', Math.floor(shifted));
		mod.Send( 'enable_translation_group', 'code_pads', Math.floor(!shifted));
		mod.Send( 'enable_translation_group', 'code_keys2', Math.floor(!shifted));
		mod.Send( 'enable_translation_group', 'code_buttons',  Math.floor(shifted));
		mod.Send( 'enable_translation_group', 'code_extras',  Math.floor(shifted));

		refresh_grid();
		refresh_keys();
	}
}

function _key(num, val)
{
	debug('_key', num, val);
	switch(altVal)
	{
		default:
			if(val>0)
			{
				change_grid_mode(num);
			}
			break;
		case 1:
			if(val>0)
			{
				Tvel=num;
				var i=3;do{
					mod.Send( 'key', 'value', i, (i==(Tvel))*(TVEL_COLORS[i]));
				}while(i--);
			}
			break;
	}
}

function surface_offset(val)
{
	grid_offset = val;
}

//this is mainly for the select-hold
function _msg_int(val)
{
	debug('msg_int', val);
	if((inlet==2)&&(pad_pressed==val))
	{
		change_key_mode(pad_invoked_key_mode);
	}
}

//this sorts key and grid input
function _list()
{
	var args=arrayfromargs(arguments);
	switch(inlet)
	{
		case 0:
			_grid(args[0], args[1], args[2]);
			break;
		case 1:
			_key(args[0], args[1]);
			break;
	}
}

function _alt(val)
{
	//because of changes in b996, alt now comes in as "alt" instead of "alt_in"
	_alt_in(val);
}

function _alt_in(val)
{
	debug('alt_in', val);
	altVal = Math.floor(val>0);
	switch(altVal)
	{
		default:
			var i=7;do{
				mod.Send( 'key', 'value', i, (i==grid_mode)*8);
			}while(i--);
			break;
		case 1:
			var i=3;do{
				mod.Send( 'key', 'value', i, (i==(Tvel))*(TVEL_COLORS[i]));
			}while(i--);
			break;
	}
	switch(grid_mode)
	{
		default:
			break;
		case 2:
			mod.Send( 'grid', 'batch', 0);
			refresh_grid();
			break;
	}
}


//input sorter for patcher calls

//called by gui object, sets visible portion of live.step
function _mode(val)
{
	debug('mode', val);
	step_mode = val;
	step.message('mode', Modes[step_mode]);
}

//from live.step
function _step_in()
{
	var args = arrayfromargs(arguments);
	if(DEBUG_STEP){post('step_in', args);}
	switch(args[0])
	{
		case 0:
			break;
		case 1:
			break;
		case 2:
			switch(args[1])
			{
				case 'changed':
					var new_value = step.getvalueof();
					outlet(3, step_value);
					if(DEBUG_STEP){post('old', step_value);}
					outlet(2, new_value);
					break;
			}
		case 3:
			break;
	}
}

//distributes input from gui button and menu elements
function _guibuttons(num, val)
{
	debug('gui_buttons', num, val);
	switch(num)
	{
		case 0:
			//padmodegui.message('int', RemotePModes[Math.max((RemotePModes.indexOf(pad_mode)+1)%3, 0)]);
			/*if(padmodeenables.length)
			{
				while(padmodeenables.indexOf(pad_mode)==-1)
				{
					pad_mode = (pad_mode+1)%7;
				}
				padmodegui.message('int', padmodeenables[(padmodeenables.indexOf(pad_mode)+1)%padmodeenables.length]);
			}*/
			resync();
			break;
		case 1:
			//keymodegui.message('int', (key_mode+1)%8);
			if(keymodeenables.length)
			{
				while(keymodeenables.indexOf(key_mode)==-1)
				{
					key_mode = (key_mode+1)%8;
				}
				keymodegui.message('int', keymodeenables[(keymodeenables.indexOf(key_mode)+1)%keymodeenables.length]);
			}
			break;
		case 2:
			rotate_pattern(selected, rot_length, -1);
			break;
		case 3:
			rotate_pattern(selected, rot_length, 1);
			break;
		case 4:
			selected.obj.set.notevalues(val);
			{
				selected.obj.set.basetime(TRANS[selected.notetype][val][0]);
				selected.obj.set.timedivisor(TRANS[selected.notetype][val][1]);
				if(timing_immediate)
				{
					selected.obj.nexttime.message('bang');
				}
				BaseTime.message('set', TRANS[selected.notetype][val][0]);
				script['Speed'+(selected.num+1)].message('set', TRANS[selected.notetype][val][1]);
			}
			break;
		case 5:
			selected.obj.set.notetype(val);
			var notevalues = selected.notevalues;
			if(notevalues < 8)
			{
				selected.obj.set.basetime(TRANS[val][notevalues][0], presets[selected.num]);
				selected.obj.set.timedivisor(TRANS[val][notevalues][1], presets[selected.num]);
				if(timing_immediate)
				{
					selected.obj.nexttime.message('bang');
				}
				BaseTime.message('set', TRANS[val][notevalues][0]);
			}
			break;
		case 6:
			if(selected.notevalues<8)
			{
				notevaluesgui.message('int', Math.max(Math.min(7, parseInt(selected.notevalues)-1), 0));
			}
			else
			{
				notevaluesgui.message('int', Math.floor(selected.timedivisor / selected.basetime).toString(2).length-1);
				notetypegui.message('set', 0);
			}
			break;
		case 7:
			if(selected.notevalues<8)
			{
				notevaluesgui.message('int', Math.max(Math.min(7, parseInt(selected.notevalues)+1), 0));
			}
			else
			{
				notevaluesgui.message('int', Math.ceil(selected.timedivisor / selected.basetime).toString(2).length);
				notetypegui.message('set', 0);
			}
			break;
		case 8:
			change_transpose(Math.max(Math.min(global_offset - transpose_steps, 96), 0));
			break;
		case 9:
			change_transpose(Math.max(Math.min(global_offset + transpose_steps, 96), 0));
			break;
		case 10:
			change_pad_mode(val);
			break;
		case 11:
			change_key_mode(val);
			break;
		case 12:
			change_transpose(val);
			break;
		case 13:
			//selected.direction = val;
			//selected.obj.direction.message('int', val);
			selected.obj.set.direction(val);
			break;
		case 14:
			debug('lock', val);
			locked = val;
			break;
		case 15:
			detect_devices();
			break;
		case 16:
			record(val);
			break;
		case 17:
			play_enabled = val;
			locked = 1;
			break;
	}
}

//distributes input from gui grid element
function _padgui_in(val)
{
	debug('padguiin', val);
	_c_grid(val%4, Math.floor(val/4), 1);
	_c_grid(val%4, Math.floor(val/4), 0);
}

//distributes input from gui key element
function _keygui_in(val)
{
	debug('keyguiin', val);
	_c_key(val%16, Math.floor(val/16), 1);
	_c_key(val%16, Math.floor(val/16), 0);

}

//displays played notes on grid
function _blink(val)
{
	//if(DEBUG_BLINK){post('blink', val);}
	if(grid_mode == 0)
	{
		mod.Send( 'receive_translation', 'keys2_'+last_mask, 'mask', -1);
		mod.Send( 'receive_translation', 'keys2_'+val, 'mask', 5);
	}
	last_mask = val;
}

//displays played notes on keys
function _vblink(num, val)
{
	debugblink('vblink', val);
	if(grid_mode == 0)
	{
		if(key_mode==0)
		{
			//mod.Send( 'mask', 'c_key', num, val);
			//grid_out('mask', 'key', num, val);
			mod.Send( 'receive_translation', 'keys_'+num, val);
		}
		//mod.Send( 'mask', 'c_grid', num%4, Math.floor(num/4), Blinks[Math.floor(val>0)]);
		//grid_out('mask', 'grid', num, val);
		mod.Send( 'receive_translation', 'pads_'+num, Blinks[Math.floor(val>0)]);
	}
}

//evaluate and distribute data recieved from the settings menu
function _settingsgui(num, val)
{
	args = arrayfromargs(arguments);
	num = args[0];
	val = args[1];
	switch(num)
	{
		//select+hold option
		case 0:
			pad_invoked_key_mode = val;
			break;
		//immediate timing option
		case 1:
			timing_immediate = val;
			break;
		//global offset
		case 2:
			global_chain_offset = val;
			_select_chain(selected.num);
			break;
		//empty
		case 3:
			break;
		//transpose steps
		case 4:
			transpose_steps = val;
			break;
		//randomize pattern
		case 5:
			randomize_pattern(randomize_global);
			break;
		//randomize velocity
		case 6:
			randomize_velocity(randomize_global);
			break;
		//randomize duration
		case 7:
			randomize_duration(randomize_global);
			break;
		//randomize behavior
		case 8:
			randomize_behavior(randomize_global);
			break;
		//randomize rulebends
		case 9:
			randomize_rulebends(randomize_global);
			break;
		//full reset
		case 10:
			reset_data(randomize_global);
			break;
		//randomize global
		case 12:
			randomize_global = val;
			break;
		//randomize all
		case 11:
			randomize_pattern(randomize_global);
			randomize_velocity(randomize_global);
			randomize_duration(randomize_global);
			randomize_behavior(randomize_global);
			randomize_rulebends(randomize_global);
			break;
		//randomize rules
		case 13:
			randomize_rules();
			break;
		//keymode enables
		case 14:
			vals = args.slice(1, 9);
			keymodeenables = [];
			for(var i=0;i<8;i++)
			{
				if(vals[i])
				{
					keymodeenables.push(i);
				}
			}
			debug('keymodeenables', keymodeenables);
			break;
		//padmode enables
		case 15:
			vals = args.slice(1, 8);
			padmodeenables = args.slice(1, 8);
			padmodeenables = [];
			for(var i=0;i<7;i++)
			{
				if(vals[i])
				{
					padmodeenables.push(i);
				}
			}
			debug('padmodeenables', padmodeenables);
			break;
		//behavior enables
		case 16:
			vals = args.slice(1, 17);
			debug('behavior enables:', vals);
			for(var i=0;i<16;i++)
			{
				if(vals[i+1]!=part[i].behavior_enable)
				{
					debug('part', i, 'behavior enable, was', part[i].behavior_enable, ', setting:', vals[i+1]);
					part[i].behavior_enable = vals[i+1];
					part[i].obj.set.behavior(vals[i+1]);
				}
			}
	}
}

//evaluate and distribute data recieved from the behavior graph in the settings menu
function behavegraph_in(behave, bar, val)
{
	behavegraph[behave][bar] = val;
	if(grid_mode==7)
	{
		mod.Send( 'grid', 'value', behave, bar, BEHAVE_COLORS[val]);
	}
}

//distribute MIDI remote control assignments to their destination
function _remote(num, val)
{
	switch(num<16)
	{
		case 0:
			_c_grid(num%4, Math.floor(num/4), 1);
			break;
		case 1:
			_c_key(num-16, val);
			break;
	}
}

//distribute
function _receive_automation(num, val)
{
	if((play_enabled>0)&&(num>110)&&(val!==0))
	{
		num-=111;
		debugrec('receive auto:', num, val);
		if(val>9)
		{
			presets[part[num].num] = val-10;
			debugrec('preset change:', part[num].num+1, presets[part[num].num]);
			storage.message('recall', 'poly.'+(part[num].num+1), presets[part[num].num]);
		}
		else if(val>0)
		{
			part[num].active = val-1;
			part[num].obj.active.message('int', part[num].active);
			if(pad_mode==2)
			{
				refresh_pads();
			}
			if(key_mode==0)
			{
				refresh_c_keys();
			}
		}
	}
}

function _grid_play(x, y, voice, val, poly)
{
	//var args = arrayfromargs(arguments);
	debug('_grid_play', x, y, voice, val, poly);
	switch(grid_mode)
	{
		case 2:
			debug('sel:', selected.num, poly);
			if(altVal>0)
			{
				if((voice==0)&&((poly-1)==selected.num))
				{
					mod.Send( 'grid', 'mask', Math.max(Math.min(x, 15), 0), Math.max(Math.min(y, 15), 0) + 1, val);
				}
			}
			else
			{
				if((voice>0)&&((poly-1)==selected.num))
				{
					mod.Send( 'grid', 'mask', Math.max(Math.min(x, 15), 0), Math.max(Math.min(y, 15), 0) + 1, val*voice);
				}
			}
			break;
	}
}


/*/////////////////////////////
///// data syncronization /////
/////////////////////////////*/


//called by pattr when it recalls a preset
////need to figure out how to deal with global preset loading....there's missing data doing things this way.
function _recall()
{
		if(DEBUG_PTR){post('recall');}
		for(var item in Objs)
		{
			//debug(Objs[item], typeof(selected[Objs[item]]), 'retrieving...');
			selected.obj.get[Objs[item].Name]();
		}
		selected.nudge = Math.floor(selected.obj.nudge.getvalueof());
		selected.steps = Math.floor(selected.obj.steps.getvalueof());
		selected.root = Math.floor(selected.obj.noteoffset.getvalueof()%12);
		selected.octave = Math.floor(selected.obj.noteoffset.getvalueof()/12);
		var i=15;do{
			part[i].active = part[i].obj.active.getvalueof();
			part[i].quantize = part[i].obj.quantize.getvalueof();
			part[i].pattern = part[i].obj.pattern.getvalueof();
			//script['Speed'+(i+1)].message('set', part[i].ticks);
			update_speed(part[i]);
		}while(i--);
		update_step();
		refresh_c_keys();
		refresh_pads();
		update_gui();
		if(key_mode>4)
		{
			var i=7;do{
				mod.Send( 'cntrlr_encoder_grid', 'custom', i%4, Math.floor(i/4),  part[i+(8*(selected.num>7))].pattern);
			}while(i--);
		}
		//select_pattern(selected.num);
		//refresh_edit_view();
		//refresh_dials();
		//refresh_lcd();
}

//called by pattr when loading a xml preset file
function read()
{
	presets = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	preset = 1;
	storage.message(preset);
}

///this is how we inject the data to the poly~ objects:
function make_funcs(part)
{
	var new_part = [];
	new_part.stepLoop = function(In, Out)
	{
		debugstep('step Loop', In, Out);
		selected.nudge = In;
		selected.obj.nudge.message('set', selected.nudge);
		selected.obj.set.nudge(selected.nudge, presets[selected.num]);
		//selected.steps = Out - In;
		//selected.obj.steps.message('int', selected.steps);
		selected.obj.set.steps(Out - In);
		selected.obj.restart.message('bang');
		refresh_c_keys();
	}
	new_part.stepDir = function(step, val)
	{
		debugstep('step Dir', step, val);
		//part.direction = val;
		//part.obj.direction.message('int', val);
		part.obj.set.direction(val);
	}
	new_part.stepNote = function(step, val)
	{
		debugstep('step note', step, val);
		part.note[step] = val;
		part.obj.set.note(part.note);
	}
	new_part.stepVel = function(step, val)
	{
		debugstep('step vel', step, val);
		part.velocity[step] = val;
		part.obj.set.velocity(part.velocity);
	}
	new_part.stepDur = function(step, val)
	{
		debugstep('step dur', step, val);
		part.duration[step] = val;
		part.obj.set.duration(part.duration);
	}
	new_part.stepExtra1 = function(step, val)
	{
		debugstep('step extra1', step, val);
		part.pattern[step] = val;
		part.obj.set.pattern(part.pattern);
		refresh_c_keys();
	}
	new_part.stepExtra2 = function(step, val)
	{
		debugstep('step extra2', step, val);
		part.rulebends[step] = val;
		part.obj.set.rulebends(part.rulebends);
	}
	return new_part
}

//called to update data in live.step when changes are made to poly
function update_step()
{
	//set_dirty(1);
	step_value = step.getvalueof();
	debugstep('update step: step_value', step_value.length, step_value);
	selected.nudge = parseInt(selected.obj.nudge.getvalueof());
	selected.steps = parseInt(selected.obj.steps.getvalueof());
	step_value[5] = Math.floor(selected.nudge);
	step_value[6] = Math.floor(selected.nudge) + Math.floor(selected.steps) + 1;
	selected.pattern = selected.obj.pattern.getvalueof();
	selected.velocity = selected.obj.velocity.getvalueof();
	selected.duration = selected.obj.duration.getvalueof();
	selected.behavior = selected.obj.behavior.getvalueof();
	selected.rulebends = selected.obj.rulebends.getvalueof();
	selected.note = selected.obj.note.getvalueof();
	var i=15;do{
		var s = 11 + (i*5);
		step_value[s] = selected.note[i];
		step_value[s + 1] = selected.velocity[i];
		step_value[s + 2] = selected.duration[i];
		step_value[s + 3] = selected.pattern[i];
		step_value[s + 4] = selected.rulebends[i];
	}while(i--);
	debugstep('to step', step_value.length, step_value);
	step.setvalueof(step_value);
}

//called to update data in poly when changes are made in livestep
function update_poly()
{
	//set_dirty(1);
	var args = arrayfromargs(arguments);
	step_value = step.getvalueof();
	debugstep('update_poly\n unmatching args', args);
	var i = args.length;do{
		if(args[i]>10)
		{
			var index = args[i]-11;
			debugstep(args[i]);
			selected.funcs[Funcs[index%5]](Math.floor(index/5), step_value[index+11]);
		}
		else
		{
			switch(args[i])
			{
				case 5:
					selected.funcs.stepLoop(step_value[args[i]], step_value[args[i]+1]-1);
					break;
				case 6:
					selected.funcs.stepLoop(step_value[args[i]-1], step_value[args[i]]-1);
					break;
			}
		}
	}while(i--);
}


/*///////////////////////
// internal processes  //
///////////////////////*/

//change the function of the keys
function change_key_mode(val)
{
	debug('key_mode', val);
	key_pressed = -1;
	key_mode = val;
	switch(key_mode)
	{
		default:
			break;
		case 5:
			//stepmodegui.message('int', 5);
			break;
	}
	keymodegui.message('set', key_mode);
	refresh_c_keys();
	refresh_extras();
	update_bank();
}

//change the function of the pad
function change_pad_mode(val)
{
	pad_mode = val;
	switch(pad_mode)
	{
		default:
			break;
	}
	//pad_pressed = -1;
	//change_key_mode(last_key_mode);
	padmodegui.message('set', pad_mode);
	refresh_pads();
	update_bank();
}

//change the function of the grid
function change_grid_mode(val)
{
	//mod.Send( 'set_legacy', val ? 1 : 0);
	mod.Send( 'set_legacy', 0);
	if((grid_mode==3)&&(val!=3))
	{
		var i=15;do{
			part[i].clutch = 1;
			part[i].obj.clutch.message('int', 1);
		}while(i--);
	}
	grid_mode = val;
	var i=15;do{
		mod.Send( 'enable_translation', 'keys_'+i, 'push_grid', (!val));
		mod.Send( 'enable_translation', 'keys2_'+i, 'push_grid', (!val));
		mod.Send( 'enable_translation', 'pads_'+i, 'push_grid', (!val));
	}while(i--);
	var i=7;do{
		mod.Send( 'enable_translation', 'extras_'+i, 'push_grid', (!val));
		mod.Send( 'enable_translation', 'buttons_'+i, 'push_grid', (!val));
	}while(i--);
	mod.Send( 'grid', 'all', 0);

	if(grid_mode == 1)
	{
			edit_preset = preset;
			var y=13;do{
				storage.getstoredvalue('poly.'+y+'::pattern', edit_preset);
				storage.getstoredvalue('poly.'+y+'::velocity', edit_preset);
			}while(y--);
	}

	refresh_grid();
	update_bank();
	var i=7;do{
		mod.Send( 'key', 'value', i, (i==grid_mode)*8);
	}while(i--);
}

//select the current pattern and load its data to CNTRLR/live.step/gui
function select_pattern(num)
{
	var range = num>7;
	if(Math.floor(selected.num/8)!=Math.floor(num/8))
	{
		var i=7;do{
			mod.Send( 'cntrlr_encoder_grid', 'custom', i%4, Math.floor(i/4),  part[i+(8*(range))].pattern);
			mod.Send( 'cntrlr_encoder_grid', 'green', i%4, Math.floor(i/4), part[i+(8*(range))].notevalues<8);
		}while(i--);
	}
	selected = part[num];
	_select_chain(num);
	update_step();
	selected_filter.message('offset', num + 1);
	refresh_pads();
	refresh_c_keys();
	update_gui();
	if(pad_mode == 5)
	{
		update_bank();
	}
}

function clear_pattern(dest)
{
	debug('clear_pattern', dest.num);
	//dest.obj.set.pattern([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	storage.copy(16, dest.num+1);
	storage.recall(dest.num+1);
	//storage.message('store', dest.num+1);
}

function copy_pattern(src, dest)
{
	debug('copy pattern', src.num, dest.num);
	dest.obj.set.pattern(src.pattern);
}

function copy_preset(part, dest)
{
	debug('preset: copy', 'poly.'+(part.num+1), presets[part.num], dest);
	for(var index in Objs)
	{
		debug('copy', 'poly.'+(part.num+1)+'::'+Objs[index].pattr, presets[part.num], dest);
		var type = Objs[index].pattr;
		var types = {'object':0, 'hidden':0};
		if(!(type in types))
		{
			part.obj.set[index](part[index], dest);
		}
	}
	//storage.copy('poly.'+(part.num+1), presets[part.num], dest);
}

function copy_global_preset(src, dest)
{
	debug('copy global preset', 'copy', src, dest);
	storage.copy(src, dest);
}

//reset all parts to play from top...not quantized.
function resync()
{
	/*var i=15;do{
		//part[i].obj.offset.message('int', 0);
		part[i].obj.resync.message('bang');
	}while(i--);*/
	//messnamed(unique+('restart'), 0);
	this.patcher.getnamed('resync').message('bang');

}

//begin or end sequence play from poly_play poly~
function play_sequence(part, note, press)
{
	if(press>0)
	{
		debug('play sequence', note);
		var trig = part.triggered.indexOf(note);
		//if the num wasn't already being held
		if(trig == -1)
		{
			debug('decoded:', (note>>6)%16, note>>10);
			part.triggered.push(note);
			part.obj.polyplay.message('midinote', note, 1);
		}
		else
		{
			//find out if num has already been played
			var held = part.held.indexOf(note);
			if(held > -1)
			{
				//remove from the held array since a new sequence has been triggered
				part.held.splice(held, 1);
				part.obj.polyplay.message('midinote', note, 0);
				var trig = part.triggered.indexOf(note);
				if(trig > -1)
				{
					part.triggered.splice(trig, 1);
				}
			}
		}
	}
	else
	{
		if(part.hold == 0)
		{
			var trig = part.triggered.indexOf(note);
			if(trig > -1)
			{
				part.triggered.splice(trig, 1);
			}
			part.obj.polyplay.message('midinote', note, 0);
		}
		else
		{
			//add to the held array, so that when hold for part is turned off the note can be flushed
			part.held.push(note);
		}
		refresh_c_keys();
	}
}

//update the current global transposition to all polys
function change_transpose(val)
{
	if(selected.channel==0)
	{
		debug('global_offset', val);
		global_offset = (Math.max(Math.min(val, 112), 0));
		transposegui.message('set', global_offset);
		for(var i = 0;i< 16;i++)
		{
			//this isn't stored with a preset
			//part[i].obj.noteoffset.message('int', global_offset + i);
			part[i].obj.set.noteoffset(global_offset+i);
		}
		_select_chain(selected.num);
	}
}

//called from key_in, change the loopOut point and update it to live.step and poly
function change_Out(val)
{
	debug('change Out', val);
	selected.obj.set.steps(val-parseInt(selected.nudge));
	update_step();
	refresh_c_keys();
}

//called from key_in, change the loopIn point and update it to the live.step and poly
function change_In(val)
{
	debug('change In', val);
	var change = parseInt(selected.nudge) - val;
	selected.nudge = val;
	if(timing_immediate)
	{
		selected.obj.set.nudge(selected.nudge);
		selected.steps += change;
		selected.obj.set.steps(selected.steps);
	}
	else
	{
		selected.obj.nudge.message('set', selected.nudge);
		selected.obj.set.nudge(selected.nudge, 0);
		//storage.setstoredvalue('poly.'+(selected.num+1)+'::nudgepattr', presets[selected.num], selected.nudge);
		selected.steps += change;
		selected.obj.set.steps(selected.steps);
		selected.obj.restart.message('bang');
	}
	update_step();
	refresh_c_keys();
}

//add a note from the pads to the appropriate poly, and trigger a message back from it
function add_note(part)
{
	debug('add_note', part.num);
	part.obj.addnote.message('bang');
	part.pattern[curSteps[part.num]]=1;
	part.obj.set.pattern(part.pattern);
	if((edit_preset == presets[part.num])&&(grid_mode==1))
	{
		storage.getstoredvalue('poly.'+(part.num+1)+'::pattern', edit_preset);
	}
	if(part==selected)
	{
		step.message('extra1', 1, selected.pattern);
		step.message('zoom', 1, 1);
		refresh_c_keys();
		mod.Send( 'cntrlr_encoder_grid', 'custom', selected.num%4, Math.floor(selected.num/4)%2,  selected.pattern);
	}
}

function play_note(part)
{
	debug('play_note', part.num);
	part.obj.addnote.message('bang');
}

/*//add new notes received from poly to the appropriate place and update display
function _addnote(num, val)
{
	num += -1;
	val += -1;
	debug('addnote', num, val);
	part[num].pattern[val] = 1;
	part[num].obj.set.pattern(part[num].pattern);
	refresh_c_keys();
	update_step();
}*/

//rotate the pattern based on the blocksize defined in the main patch
function rotate_pattern(part, len, dir)
{
	//post('rotate_pattern', len, dir);
	var bits = Math.ceil(16/len);
	var Out;
	var In;
	if(dir < 0)
	{
		for(var i=0;i<bits;i++)
		{
			Out = Math.min(parseInt((len*(i+1))-1), 15);
			In = len*i;
			part.pattern.splice(Out, 0, parseInt(part.pattern.splice(In, 1)));
			part.velocity.splice(Out, 0, parseInt(part.velocity.splice(In, 1)));
			part.duration.splice(Out, 0, parseInt(part.duration.splice(In, 1)));
			part.note.splice(Out, 0, parseInt(part.note.splice(In, 1)));
		}
	}
	else
	{
		for(var i=0;i<bits;i++)
		{
			Out = len*i;
			In = Math.min(parseInt((len*(i+1))-1), 15);
			part.pattern.splice(Out, 0, parseInt(part.pattern.splice(In, 1)));
			part.velocity.splice(Out, 0, parseInt(part.velocity.splice(In, 1)));
			part.duration.splice(Out, 0, parseInt(part.duration.splice(In, 1)));
			part.note.splice(Out, 0, parseInt(part.note.splice(In, 1)));
		}
	}
	var pset = presets[part.num];
	part.obj.set.pattern(part.pattern);
	part.obj.set.velocity(part.velocity);
	part.obj.set.duration(part.duration);
	part.obj.set.note(part.note);
	update_step();
	refresh_c_keys();
}

//change the display on the CNTRLR encoder rings to reflect the current play position when in freewheel mode
function rotate_wheel(num, pos)
{

	if(pad_mode==5)
	{
		if((selected.num<8)&&(num<9))
		{
			var _num = num-1;
			if(grid_mode == 0){mod.Send( 'cntrlr_encoder_grid', 'value', _num%4, Math.floor(_num/4), pos);}
		}
		else if((selected.num>7)&&(num>8))
		{
			var _num = num-9;
			if(grid_mode == 0){mod.Send( 'cntrlr_encoder_grid', 'value', _num%4, Math.floor(_num/4), pos);}
		}
	}
	switch(grid_mode)
	{
		case 0:
			//debug('rotate_wheel', num, pos);
			if((key_mode==5)&&(num==selected.num+1))
			{
				//debug('current_step', num, pos);
				mod.Send( 'receive_translation', 'keys2_'+(selected.note[current_step]), 'mask', -1);
				mod.Send( 'receive_translation', 'keys2_'+(selected.note[pos]), 'mask', 5);
			}
			break;
		case 1:
			//tr256 mode
			var _num = num-1;
			if((_num<14)&&(preset==edit_preset))
			{
				mod.Send( 'grid', 'mask', curSteps[_num], _num+2, -1);
				mod.Send( 'grid', 'mask', pos, _num+2, 5+(_num==selected.num));
			}
			break;
		case 2:
			if(altVal>0)
			{
			}
			break;
		case 3:
			//cafe mode
			//var pat = part[num-1].pattern.slice();
			var _num=num-1, Part = part[_num];
			//debug('cafe_pos', _num, Part.clutch)
			if(Part.clutch > 0)
			{
				var i=15;do{
						mod.Send( 'grid', 'value', i, _num, Part.pattern[(pos+i)%16]);
				}while(i--);
			}
			break;
		case 4:
			//boingg mode
			var _num=num-1;
			if(part[_num].active>0)
			{
				mod.Send( 'grid', 'mask', _num, curSteps[_num], -1);
				mod.Send( 'grid', 'mask', _num, pos, 1);
			}
			break;
		default:
			break;
	}
	current_step = pos;
	curSteps[num-1] = pos;
}

//synchronize two parts when holding down select while selecting another part
function sync_wheels(master, slave)
{
	debug('sync_wheels', master.num, slave.num);
	if(slave.lock != master.lock)
	{
		slave.lock = master.lock;
		slave.obj.set.quantize(slave.lock);
		mod.Send( 'cntrlr_encoder_grid', 'green', slave.num%4, Math.floor(slave.num/4)%2,  slave.lock);
	}
	/*switch(master.lock)
	{
		case 0:
			//slave.obj.set.ticks(master.ticks);
			break;
		case 1:
			slave.obj.set.notevalues(master.notevalues);
			slave.obj.set.notetype(master.notetype);
			break;
	}*/
	slave.obj.set.timedivisor(master.obj.timedivisor.getvalueof());
	slave.obj.set.basetime(master.obj.basetime.getvalueof());
	update_speed(slave);
}

//change the variables necessary to change the quantization status of a part
function change_lock_status(part, dir)
{
	if(DEBUG_LOCK){post('change_lock_status', part.num);}
	if(dir==undefined){dir = 0;}
	if(part==selected)
	{
		update_gui();
	}
	mod.Send( 'cntrlr_encoder_grid', 'green', part.num%4, Math.floor(part.num/4)%2,	 part.notevalues<8);
	update_speed(part);
}

//update the current value reflected on the invisible ui speed controls
function update_speed(part)
{
	part.notevalues = part.obj.notevalues.getvalueof();
	part.notetype = part.obj.notetype.getvalueof();
	script['Speed'+(part.num+1)].message('set', part.obj.timedivisor.getvalueof());
}

//release any polyplay sequences from being held when the hold key is turned off
function release_held_sequences(part)
{
	//debug('release held seqs', part.held);
	for(var i in part.held)
	{
		part.obj.polyplay.message('midinote', part.held[i], 0);
		var trig = part.triggered.indexOf(part.held[i]);
		if(trig > -1)
		{
			part.triggered.splice(trig, 1);
		}
	}
	part.held = [];
}

//change the hold state of the selected polyplay object
function poly_hold_toggle()
{
	selected.hold = Math.abs(selected.hold-1);
	//mod.Send( 'c_button', 3, 2, selected.hold);
	//grid_out('default', 'button', 3, 2, selected.hold);
	if(grid_mode==0){mod.Send( 'receive_translation', 'buttons_'+6, 'value', selected.hold);}
	if(grid_mode==3)
	{
		refresh_grid();
	}
	if(selected.hold<1)
	{
		release_held_sequences(selected);
	}
}

//set the dirty flag so that parts sequence is saved when selecting a new part or preset
function set_dirty(val)
{
	dirty=val;
	debug('dirty:', val);
}


/*	  automation	 */


//enable recording of preset changes and mutes to a live.clip
function record(val)
{
	if(val > 0)
	{
		record_enabled = begin_record();
	}
	else
	{
		record_enabled = 0;
	}
	debugrec('record_enabled', record_enabled);
}

//check api for current clip and return confirmation of recording
function begin_record()
{
	finder.goto('this_device');
	finder.goto('canonical_parent');
	var playing_slot_index = parseInt(finder.get('playing_slot_index'));
	debugrec('playing_slot_index:', playing_slot_index);
	if(playing_slot_index>=0)
	{
		finder.goto('clip_slots', playing_slot_index, 'clip');
		autoclip.id = parseInt(finder.id);
	}
	return (parseInt(autoclip.id)>0);
}

//add automation steps directly to the attached Live clip
function add_automation(part, type, val)
{
	if(record_enabled)
	{
		autoclip.call('select_all_notes');
		var notes = autoclip.call('get_selected_notes');
		var num = parseInt(notes[1]);
		switch(type)
		{
			case 'mute':
				new_notes = notes.slice(2, -1).concat(['note', part.num+111, Math.round(autoclip.get('playing_position')*100)/100, .2, val+1, 0]);
				break;
			case 'preset':
				new_notes = notes.slice(2, -1).concat(['note', part.num+111, Math.round(autoclip.get('playing_position')*100)/100, .2, val+10, 0]);
				break;
		}
		debugrec('notes:', new_notes);
		finder.call('replace_selected_notes');
		finder.call('notes', num+1);
		for(var i = 0;i<new_notes.length;i+=6)
		{
			finder.call('note', new_notes[i+1], new_notes[i+2]+.001, new_notes[i+3]+.001, new_notes[i+4], new_notes[i+5]);
		}
		finder.call('done');
		//debugrec('new_notes:', finder.call('get_selected_notes'));
	}
}

function receive_record(note, val)
{
	if(grid_mode==1)
	{
		if(val>0)
		{
			var i=15;do{
				if(note==part[i].noteoffset)
				{
					var Part=part[i], pat= Part.edit_buffer, cur_step=curSteps[i];
					Part.edit_buffer[cur_step] = 1;
					Part.pattern = Part.edit_buffer;
					Part.obj.pattern.message('list', Part.edit_buffer);
					Part.edit_velocity[cur_step] = val;
					Part.velocity = Part.edit_velocity;
					Part.obj.velocity.message('list', Part.edit_velocity);
					Part.recdirty=1;
					if(i<14)
					{
						mod.Send( 'grid', 'value',	cur_step, i+2, ACCENTS[Math.floor(val/8)]);
					}
					if(i==selected.num)
					{
						refresh_c_keys();
						step.message('velocity', 1, selected.velocity);
						step.message('extra1', 1, selected.pattern);
						step.message('zoom', 1, 1);
					}
				}
			}while(i--);
		}
	}
}

function set_record(val)
{
	rec_enabled=val;
	if(!rec_enabled)
	{
		storage.message('store', preset);
	}
	this.patcher.getnamed('midiout').subpatcher().getnamed('recgate').message(rec_enabled);
}


/*	 settings		*/


//all of these do , pretty much what they say
function randomize_pattern(global)
{
	if(global>0)
	{
		debug('global pattern random');
		var h=15;do{
			var i=15;do{
				var seq = [];
				var j=15;do{
					seq[j]=Math.round(Math.random());
				}while(j--);
				part[i].obj.set.pattern(seq, h+1);
			}while(i--);
		}while(h--);
	}
	else
	{
		var i=15;do{
			var j=15;do{
				part[i].pattern[j]=Math.round(Math.random());
			}while(j--);
			part[i].obj.set.pattern(part[i].pattern);
		}while(i--);
	}
	update_step();
	refresh_c_keys();
}

function randomize_notes(global)
{
	if(global>0)
	{
		debug('global pattern random');
		var h=15;do{
			var i=15;do{
				var seq = [];
				var j=15;do{
					seq[j]=Math.round(Math.random()*16);
				}while(j--);
				part[i].obj.set.note(seq, h+1);
			}while(i--);
		}while(h--);
	}
	else
	{
		var i=15;do{
			var j=15;do{
				part[i].note[j]=Math.round(Math.random()*16);
			}while(j--);
			part[i].obj.set.note(part[i].note);
		}while(i--);
	}
	update_step();
	refresh_c_keys();
}

function randomize_velocity(global)
{
	if(global)
	{
		var h=15;do{
			var i=15;do{
				var seq = [];
				var j=15;do{
					seq[j]=Math.round(Math.random()*127);
				}while(j--);
				part[i].obj.set.velocity(seq, h+1);
			}while(i--);
		}while(h--);
	}
	else
	{
		var i=15;do{
			var j=15;do{
				part[i].velocity[j]=Math.floor(Math.random()*127);
			}while(j--);
			part[i].obj.set.velocity(part[i].velocity);
		}while(i--);
	}
	update_step();
}

function randomize_duration(global)
{
	if(global)
	{
		var h=15;do{
			var i=15;do{
				var seq = [];
				var j=15;do{
					seq[j]=Math.round(Math.random()*7);
				}while(j--);
				part[i].obj.set.duration(seq, h+1);
			}while(i--);
		}while(h--);
	}
	else
	{
		var i=15;do{
			var j=15;do{
				part[i].duration[j]=Math.floor(Math.random()*7);
			}while(j--);
			part[i].obj.set.duration(part[i].duration);
		}while(i--);
	}
	update_step();
}

function randomize_rulebends(global)
{
	if(global)
	{
		var h=15;do{
			var i=15;do{
				var seq = [];
				var j=15;do{
					seq[j]=Math.round(Math.random()*15);
				}while(j--);
				part[i].obj.set.rulebends(seq, h+1);
			}while(i--);
		}while(h--);
	}
	else
	{
		var i=15;do{
			var j=15;do{
				part[i].rulebends[j]=Math.floor(Math.random()*15);
			}while(j--);
			part[i].obj.set.rulebends(part[i].rulebends);
		}while(i--);
	}
	update_step();
}

function randomize_behavior(global)
{
	if(global)
	{
		var h=15;do{
			var i=15;do{
				var seq = [];
				var j=15;do{
					seq[j]=Math.round(Math.random()*7);
				}while(j--);;
				part[i].obj.set.behavior(seq, h+1);
			}while(i--);
		}while(h--);
	}
	else
	{
		var i=15;do{
			var j=15;do{
				part[i].behavior[j]=Math.round(Math.random()*7);
			}while(j--);
			part[i].obj.set.behavior(part[i].behavior);
		}while(i--);
	}
	if(key_mode == 2)
	{
		refresh_c_keys();
	}
}

function randomize_rules()
{
	var i=6;do{
		var j=7;do{
			rulemap.message(i, j, Math.round(Math.random()*7));
		}while(j--);
	}while(i--);
}

function reset_data(global)
{
	var i=15;do{
		var Part = part[i];
		var pset = presets[Part.num];
		Part.obj.set.rulebends(default_pattern.slice());
		Part.obj.set.pattern(default_pattern.slice());
		Part.obj.set.behavior(default_pattern.slice());
		Part.obj.set.velocity(default_velocity.slice());
		Part.obj.set.duration(default_duration.slice());
		Part.obj.set.note(default_pattern.slice());
		Part.obj.set.basetime(1);
		Part.obj.set.timedivisor(4);
		Part.obj.set.notetype(0);
		Part.obj.set.notevalues(2);
		Part.obj.set.active(1);
	}while(i--);
	if(global)
	{
		var h=16;do{
			storage.message('store', h);
		}while(h--);
	}
	update_step();
	refresh_c_keys();
}

function init_storage()
{
	post('init_storage');
	var storage = this.patcher.getnamed('storage');
	var i=15;do{
		storage.setstoredvalue('poly.'+(i+1)+'::swingpattr', 1, .5);
		storage.setstoredvalue('poly.'+(i+1)+'::stepspattr', 1, 15);
		storage.setstoredvalue('poly.'+(i+1)+'::directionpattr', 1, 0);
		storage.setstoredvalue('poly.'+(i+1)+'::randompattr', 1, 0);
		storage.setstoredvalue('poly.'+(i+1)+'::nudgepattr', 1, 0);
		storage.setstoredvalue('poly.'+(i+1)+'::rulebends', 1, default_pattern.slice());
		storage.setstoredvalue('poly.'+(i+1)+'::pattern', 1, default_pattern.slice());
		storage.setstoredvalue('poly.'+(i+1)+'::behavior', 1, default_pattern.slice());
		storage.setstoredvalue('poly.'+(i+1)+'::velocity', 1, default_velocity.slice());
		storage.setstoredvalue('poly.'+(i+1)+'::duration', 1, default_duration.slice());
		storage.setstoredvalue('poly.'+(i+1)+'::note', 1, default_pattern.slice());
		storage.setstoredvalue('poly.'+(i+1)+'::basetimepattr', 1, 1);
		storage.setstoredvalue('poly.'+(i+1)+'::timedivisorpattr', 1, 4);
		storage.setstoredvalue('poly.'+(i+1)+'::notetypepattr', 1, 0);
		storage.setstoredvalue('poly.'+(i+1)+'::notevaluepattr', 1, 2);
		storage.setstoredvalue('poly.'+(i+1)+'::active', 1, 1)
		storage.setstoredvalue('poly.'+(i+1)+'::behavior_enable', 1, 1);
		storage.setstoredvalue('poly.'+(i+1)+'::multiplierpattr', 1, 1)
	}while(i--);
	storage.message(1);
	var h=16;do{
		storage.message('store', h);
	}while(h--);
	debug('done!');
}

//remove any masked elements on the CNTRLR
function demask()
{
	debug('demask');
}

//update gui elements to reflect current data
function update_gui()
{
	directiongui.message('set', selected.obj.direction.getvalueof());
	notevaluesgui.message('set', selected.obj.notevalues.getvalueof());
	notetypegui.message('set', selected.obj.notetype.getvalueof());
	Random.message('set', selected.obj.random.getvalueof());
	Groove.message('set', (selected.obj.swing.getvalueof()*100)-50);
	Channel.message('set', selected.obj.channel.getvalueof());
	Mode.message('set', selected.obj.mode.getvalueof());
	BaseTime.message('set', selected.obj.basetime.getvalueof());
	PolyOffset.message('set', selected.obj.polyoffset.getvalueof());
	Speed.message('set', script['Speed'+(selected.num+1)].getvalueof());
	Multiplier.message('set', selected.obj.multiplier.getvalueof());
	if((pad_mode == 6)||(key_mode == 6))
	{
		//mod.Send( 'c_button', 3, 2, selected.hold);
		//grid_out('default', 'button', 3, 2, selected.hold);
		outlet('receive_translation', 'buttons_'+6, selected.hold);
	}
}

//update the current bank assignment in Python
function update_bank()
{
	switch(pad_mode)
	{
		default:
			//mod.Send( 'receive_device', 'set_mod_device_bank', selected.channel>0);
			//mod.Send( 'set_device_bank', selected.channel>0);
			mod.Send( 'receive_device', 'set_mod_device_bank', selected.channel>0 ? 1 : drumgroup_is_present ? 0 : 1);
			mod.Send( 'cntrlr_encoder_grid', 'local', 1);
			mod.Send( 'code_encoder_grid', 'local', 1);

			/*var i=7;do{
				params[Encoders[i]].hidden = 0;
				params[Speeds[i]].hidden = 1;
				params[Speeds[i+8]].hidden = 1;
			}while(i--);*/
			break;
		case 5:
			mod.Send( 'receive_device', 'set_mod_device_bank', 2+(selected.num>7));
			mod.Send( 'cntrlr_encoder_grid', 'local', 0);
			mod.Send( 'code_encoder_grid', 'local', 0);
			var r = (selected.num>7)*8;
			var i=7;do{
				/*params[Encoders[i]].hidden = 1;
				params[Speeds[i]].hidden = selected.num>7;
				params[Speeds[i+8]].hidden = selected.num<8;*/
				var x = i%4;
				var y = Math.floor(i/4);
				mod.Send( 'cntrlr_encoder_grid', 'mode', x, y, 4);
				mod.Send( 'cntrlr_encoder_grid', 'custom', x, y, part[i+r].pattern);
				mod.Send( 'cntrlr_encoder_grid', 'green', x, y,	 part[i+r].lock);
			}while(i--);
			var i=3;do{
				mod.Send( 'cntrlr_encoder_grid', 'mode', i, 2,	5);
				mod.Send( 'cntrlr_encoder_grid', 'green', i, 2, 0);
			}while(i--);
			break;
	}
	rotgate.message('int', ((pad_mode==5)||(key_mode==5)||(grid_mode==1)||(grid_mode==2)||(grid_mode==3)||(grid_mode==4)));
}

//open the floating editor, called from MonomodComponent
function pop(val)
{
	debug('pop', val);
	switch(val)
	{
		case 0:
			///this.patcher.parentpatcher.wind.sendtoback();
			messnamed(unique+'pop', 'close');
			break;
		case 1:
			//this.patcher.parentpatcher.front();
			messnamed(unique+'pop', 'open');
			var parent = this.patcher.parentpatcher.getnamed('hex_mod');
			parent.window('flags', 'nozoom');
			parent.window('flags', 'nogrow');
			parent.window('flags', 'float');
			parent.window('exec');
			break;
	}
}

function pop(){}

/*///////////////////////////
//	   Device Component	   //
//		  and LCD		   //
///////////////////////////*/

var pns=[];
var mps=[];
var found_device = 0;
var params = [];
var dials = [];

var Encoders = ['Encoder_0', 'Encoder_1', 'Encoder_2', 'Encoder_3', 'Encoder_4', 'Encoder_5', 'Encoder_6', 'Encoder_7', 'Encoder_8', 'Encoder_9', 'Encoder_10', 'Encoder_11'];
var Speeds = ['Speed1', 'Speed2', 'Speed3', 'Speed4', 'Speed5', 'Speed6', 'Speed7', 'Speed8', 'Speed9', 'Speed10', 'Speed11', 'Speed12', 'Speed13', 'Speed14', 'Speed15', 'Speed16'];
var Dials =	 ['Channel', 'Groove', 'Random', 'BaseTime', 'GlobSpeed', 'PolyOffset', 'Mode', 'RotSize', 'Speed'];
var Dial_Mappings = ['Encoder_8', 'Encoder_9', 'Encoder_10', 'Encoder_11', 'Encoder_11', 'Encoder_4', 'Encoder_5', 'Encoder_10', 'Encoder_6'];
Warning = ['missing', 'device', 'assignment', 'for', 'the', 'currently', 'selected', 'channel', ' ', ' ', ' ', ' '];

// called from init
function init_device()
{
	mod.Send('receive_device', 'set_mod_device_type', 'Hex');
	mod.Send('receive_device', 'set_number_params', 16);
	//mod.Send('recieve_device', 'set_number_custom', 4);
	for(var dev_type in HEX_BANKS)
	{
		for(var bank_num in HEX_BANKS[dev_type])
		{
			mod.SendDirect('receive_device_proxy', 'set_bank_dict_entry', dev_type, bank_num, HEX_BANKS[dev_type][bank_num]);
		}
		//mod.Send('receive_device_proxy', 'update_parameters');
	}
	finder = new LiveAPI(callback, 'this_device');
	pns['device_name']=this.patcher.getnamed('device_name');
	for(var i=0;i<12;i++)
	{
		pns[Encoders[i]]=this.patcher.getnamed('pn'+(i+1));
		pns[Encoders[i]].message('text', ' ');
		mps[Encoders[i]]=this.patcher.getnamed('mp'+(i+1));
		mps[Encoders[i]].message('text', ' ');
		params[Encoders[i]]=this.patcher.getnamed(Encoders[i]);
		params[Encoders[i]].message('set', 0);
	}
	for(var i=0;i<8;i++)
	{
		params[Speeds[i]] = this.patcher.getnamed(Speeds[i]);
		params[Speeds[i+8]] = this.patcher.getnamed(Speeds[i+8]);
	}
	for(var i=0;i<9;i++)
	{
		params[Dials[i]]=this.patcher.getnamed(Dial_Mappings[i]);
		params[Dials[i]].message('set', 0);
	}
	detect_drumrack();
}

function detect_devices()
{
	this.patcher.getnamed('devices').front();
}

function detect_drumrack()
{
	//setup the initial API path:
	if(devices[0] > 0)
	{
		devices[0] = check_device_id(devices[0], selected.channel);
	}
	if(devices[0] == 0)
	{
		finder.goto('this_device');
		var this_id = parseInt(finder.id);
		finder.goto('canonical_parent');
		var track_id = parseInt(finder.id);
		var found_devices = finder.getcount('devices');
		for (var i=0;i<found_devices;i++)
		{
			finder.id = track_id;
			finder.goto('devices', i);
			if(finder.get('class_name')=='DrumGroupDevice')
			{
				drumgroup_is_present = true;
				debug("DrumRack found");
				devices[0] = parseInt(finder.id);
				//debug('DrumRack found', devices[0]);
				break;
			}
		}
	}
	if(devices[0] == 0)
	{
		showerror();
	}
	else
	{
		hideerror();
		detect_custom_devices();
		_select_chain(selected.num)
		//report_drumrack_id();
	}
}

//called fram pattr that stores any device id that was selected by the user last session
function set_devices()
{
	var ids = arrayfromargs(arguments);
	debug('set_devices', ids);
	devices = ids;
}

//find the appointed_device
function detect_device(channel)
{
	debug('select_device');
	finder.goto('live_set', 'appointed_device');
	debug('device id ==', finder.id);
	if(check_device_id(parseInt(finder.id), channel)>0)
	{
		_select_chain(selected.num);
	}
	//this.patcher.getnamed('devices').wclose();
}

//check to make sure previous found_device is valid
function check_device_id(id, channel)
{
	var found = 0;
	debug('device_id', id);
	if(id>0)
	{
		if(channel == 0)
		{
			finder.id = id;
			if(finder.get('class_name')=='DrumGroupDevice')
			{
				drumgroup_is_present = true;
				found = parseInt(finder.id);
				debug('found at:', finder.get('name'));
			}
			else
			{
				finder.goto('canonical_parent');
				finder.goto('canonical_parent');
				if(finder.get('class_name')=='DrumGroupDevice')
				{
					drumgroup_is_present = true;
					found = parseInt(finder.id);
					debug('found at 2nd pass: ', finder.get('name'));
				}
			}
		}
		else
		{
			finder.id = id;
			found = parseInt(finder.id);
			debug('non-drumrack found at:', finder.get('name'));
		}
	}
	devices[channel] = found;
	this.patcher.getnamed('devices').subpatcher().getnamed('devices').message('list', devices);
	return found;
}

//send the current chain assignment to mod.js
function _select_chain(chain_num)
{
	debug('select_chain', chain_num, selected.channel, devices[selected.channel]);
	if((selected.channel==0)&&(drumgroup_is_present))
	{
		//mod.Send( 'set_device_parent', devices[selected.channel]);
		//mod.Send( 'set_device_chain', Math.max(0, Math.min(chain_num + global_offset - global_chain_offset, 112)));
		// mod.Send( 'send_explicit', 'receive_device', 'set_mod_device_parent', 'id', devices[selected.channel]);
		//mod.Send( 'receive_device', 'set_mod_device_chain', Math.max(0, Math.min(chain_num + global_offset - global_chain_offset, 112)));
		mod.Send( 'send_explicit', 'receive_device_proxy', 'set_mod_device_parent', 'id', devices[selected.channel]);

		// mod.Send( 'receive_device', 'set_mod_drum_pad', Math.max(0, Math.min(chain_num + global_offset - global_chain_offset, 112)));
		mod.Send( 'receive_device_proxy', 'set_mod_drum_pad', Math.max(0, Math.min(chain_num + global_offset - global_chain_offset, 112)));

	}
	else
	{
		//mod.Send( 'set_device_single', devices[selected.channel]);
		// mod.Send( 'send_explicit', 'receive_device', 'set_mod_device_parent', 'id', devices[selected.channel], 1);
		mod.Send('send_explicit', 'receive_device_proxy', 'set_mod_device_parent', 'id', devices[selected.channel], 1);

	}
	// mod.Send( 'receive_device', 'refresh_lcd');
	if(devices[selected.channel]==0)
	{
		showerror();
	}
	update_bank();
}

//sort calls to the internal LCD
function _lcd(obj, type, val)
{
	//debug('new_lcd', obj, type, val);
	debuglcd('lcd', obj, type, val);
	if((type=='lcd_name')&&(val!=undefined))
	{
		if(pns[obj])
		{
			pns[obj].message('text', val.replace(/_/g, ' '));
		}
	}
	else if((type == 'lcd_value')&&(val!=undefined))
	{
		if(mps[obj])
		{
			mps[obj].message('text', val.replace(/_/g, ' '));
		}
	}
	else if((type == 'encoder_value')&&(val!=undefined))
	{
		if(params[obj])
		{
			params[obj].message('set', val);
		}
	}
}

//distribute gui knobs to their destinations
function _encoder(num, val)
{
	debug('encoder in', num, val);
	//if((num>0)&&(num<4))
	//{
	//	mod.Send('receive_device_proxy', 'set_custom_parameter_value', num, value);
	//}
	if(num<12)
	{
		// mod.Send( 'receive_device', 'set_mod_parameter_value', num, val);
		mod.Send( 'receive_device_proxy', 'set_mod_parameter_value', num, val);
	}
	else
	{
		switch(num)
		{
			case 12:
				//neither are pattr linked
				//selected.channel = val;
				//selected.polyenable = selected.channel > 0;
				//selected.obj.polyenable.message('int', selected.polyenable);
				selected.obj.set.polyenable(val>0);
				//selected.obj.channel.message('int', selected.channel);
				selected.obj.set.channel(val);
				_select_chain(selected.num);
				break;
			case 13:
				//selected.swing = (val+50)/100;
				//selected.obj.swing.message('float', selected.swing);
				selected.obj.set.swing((val+50)/100);
				//debug('swing val', val);
				break;
			case 14:
				//selected.random = val;
				//selected.obj.random.message('float', selected.random);
				selected.obj.set.random(val);
				break;
			case 15:
				rot_length = val;
				break;
			case 16:
				//not pattr linked or exposed
				//selected.repeat = val;
				//selected.obj.repeat.message('int', selected.repeat);
				//selected.obj.set.repeat(val);
				selected.obj.set.basetime(val);
				break;
			case 17:
				//global speed
				break;
			case 18:
				//not pattr linked
				//selected.polyoffset = val;
				//selected.obj.polyoffset.message('int', selected.polyoffset);
				selected.obj.set.polyoffset(val);
				break;
			case 19:
				//selected.mode = val;
				//selected.obj.mode.message('int', selected.mode);
				selected.obj.set.mode(val);
				break;
			case 20:
				//repeat
				break;
			case 21:
				script['Speed'+(selected.num+1)].message('int', val);
				break;
		}
	}
}

//called from invisible ui controls that the MonoDeviceComponent latches to in 2nd/3rd bank indexes
function _speed(num, val)
{
	//debug('speed', num, val);
	var new_time = 8, Part = part[num];
	if(TIMES[val])
	{
		new_time = TIMES[val+''];
	}
	if(new_time!=Part.notevalues)
	{
		Part.obj.set.notevalues(new_time);
	}
	Part.obj.set.timedivisor(val);
	if(Part == selected)
	{
		notevaluesgui.message('set', new_time);
	}
	Part.obj.nexttime.message('bang');
}

function _encoder_multiplier(val)
{
	//debug('_multiplier:', val);
	selected.obj.set.multiplier(val);
}

function _quant_enable(val)
{
	debug('_quant_enable:', val);
	selected.obj.set.quantize(val);

}

//called from visible ui elements and distributed to MonoDeviceComponent in 2nd/3rd bank indexes
function set_speed(num, val)
{
	//debug('set_speed', num, val);
	script['Speed'+(num+1)].message('set', val);
	_speed(num, val);
}

//Used for UI warning. Uses the lcd objects to display an error message.
function showerror()
{
	pns.device_name.message('text', 'Detect Instrument');
	for(var i=0;i<8;i++)
	{
		pns[Encoders[i]].message('text', Warning[i]);
		mps[Encoders[i]].message('text', ' ');
	}
}

//Used for UI warning.	Uses the lcd objects to display an error message.
function hideerror()
{
	pns.device_name.message('text', 'Drumrack Found');
	for(var i=0;i<12;i++)
	{
		pns[Encoders[i]].message('text', ' ');
	}
}

///po10 specific

function _reset_params_to_default()
{
	debug('_reset_params_to_default');
	mod.Send( 'send_explicit', 'receive_device', 'set_all_params_to_defaults' );
	//reset_speeds();
	//reset_multipliers();
}

function reset_sequence()
{
	debug('mod reset_sequence()');
	this.patcher.getnamed('moddial').message('int', 0);
	refresh_c_keys();
	_reset_params_to_default();
	recall_base_pattern();
	this.patcher.getnamed('moddial').message('int', 127);
}

function recall_base_pattern()
{
	storage.message(6);
}

function _moddial_change(val)
{
	refresh_c_keys();
}

function reset_speeds()
{
	for(var i=0;i<16;i++)
	{
		set_speed(i, 4);
	}
	Speed.message('int', 4);
}

function reset_multipliers()
{
	for(var i=0;i<16;i++)
	{
		//part[i].multiplier = 1;
		part[i].obj.multiplier.message('float', 1);
	}
	Multiplier.message('float', 1);
}

function bitcrusherOnOff_callback(val)
{
	if(val[0]=='value')
	{
		bitcrusherOnOff_value = val[1];
		refresh_c_keys();
	}
}

function detect_custom_devices()
{
	finder.goto('this_device');
	var this_id = parseInt(finder.id);
	finder.goto('canonical_parent');
	var track_id = parseInt(finder.id);
	var found_devices = finder.get('devices').filter(function(element){return element !== 'id';});
	debug('found_devices:', found_devices);
	var index = found_devices.indexOf(devices[0]);
	if(found_devices.length>(index))
	{
		finder.id = parseInt(found_devices[index+1]);
		finder.goto('parameters', 0);
		var new_parameter_id = parseInt(finder.id);
		bitcrusherOnOff_api = new LiveAPI(bitcrusherOnOff_callback, 'live_set');
		bitcrusherOnOff_api.id = new_parameter_id;
		bitcrusherOnOff_api.property = 'value';
		custom_device_ids[0] = new_parameter_id;

		mod.Send('send_explicit', 'receive_device_proxy', 'set_custom_parameter', 0, 'id', new_parameter_id);
		debug('set parameter:', new_parameter_id, finder.get('name'));
	}
	if(found_devices.length>(index+1))
	{
		finder.id = parseInt(found_devices[index+2]);
		finder.goto('parameters', 1);
		var new_parameter_id = parseInt(finder.id);
		custom_device_ids[1] = new_parameter_id;
		mod.Send('send_explicit', 'receive_device_proxy', 'set_custom_parameter', 1, 'id', new_parameter_id);
		debug('set parameter:', new_parameter_id, finder.get('name'));
	}
	if(found_devices.length>(index+2))
	{
		finder.id = parseInt(found_devices[index+3]);
		finder.goto('parameters', 1);
		var new_parameter_id = parseInt(finder.id);
		custom_device_ids[2] = new_parameter_id;
		mod.Send('send_explicit', 'receive_device_proxy', 'set_custom_parameter', 2, 'id', new_parameter_id);
		debug('set parameter:', new_parameter_id, finder.get('name'));
	}
	if(found_devices.length>(index+3))
	{
		finder.id = parseInt(found_devices[index+4]);
		finder.goto('parameters', 1);
		var new_parameter_id = parseInt(finder.id);
		custom_device_ids[3] = new_parameter_id;
		mod.Send('send_explicit', 'receive_device_proxy', 'set_custom_parameter', 3, 'id', new_parameter_id);
		debug('set parameter:', new_parameter_id, finder.get('name'));
	}
	//mod.Send('send_explicit', 'receive_device_proxy', 'set_custom_parameter', 0, 'id', new_parameter_id);
}

function toggle_bitcrusher()
{
	mod.Send( 'send_explicit', 'receive_device', 'toggle_param', 'id', custom_device_ids[0]);
}

function set_custom_parameter_to_default(num)
{
	mod.Send( 'send_explicit', 'receive_device', 'set_param_to_default', 'id', custom_device_ids[num]);
}

function set_internal_parameter_to_default(num)
{
	//mod.Send( 'send_explicit', 'receive_device_proxy', 'set_mod_parameter_value', num, DEFAULT_MOD_PARAM_VALUES[num]);
}

function set_mod_parameter_to_default(num)
{
	mod.Send( 'send_explicit', 'receive_device_proxy', 'set_mod_parameter_to_default', num+1);
}

function hardkill_patch_resync()
{
		debug('hardkill_patch_resync');
		reset_multipliers();
		reset_speeds();
		resync();
}


forceload(this);
