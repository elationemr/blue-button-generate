(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.newDocument = function () {
	return document.implementation.createDocument("", "", null);
};

exports.newNode = function (xmlDoc, name, text) {
	var doc =  xmlDoc.ownerDocument || xmlDoc;

	var element = doc.createElement(name);
	if ((text !== undefined) && (text !== null)) {
		var textNode = doc.createTextNode(text);
		element.appendChild(textNode);
	}
	if (xmlDoc.ownerDocument) {
		xmlDoc.appendChild(element);
	} else {
		xmlDoc.appendChild(element);
	}
	return element;
};

exports.nodeAttr = function (node, attr) {
	Object.keys(attr).forEach(function(key) {
		var value = attr[key];
		node.setAttribute(key, value);
	});
};

exports.serializeToString = function (xmlDoc) {
	var serializer = new XMLSerializer();
	var result = serializer.serializeToString(xmlDoc);
	return result;
};

},{}],2:[function(require,module,exports){
"use strict";

/*
This script converts CCDA data in JSON format (originally generated from a Continuity of Care Document (CCD) in 
standard XML/CCDA format) back to XML/CCDA format.
*/

var engine = require('./lib/engine');
var documentLevel = require('./lib/documentLevel');

var createContext = (function () {
    var base = {
        nextReference: function (referenceKey) {
            var index = this.references[referenceKey] || 0;
            ++index;
            this.references[referenceKey] = index;
            return "#" + referenceKey + index;
        },
        sameReference: function (referenceKey) {
            var index = this.references[referenceKey] || 0;
            return "#" + referenceKey + index;
        }
    };

    return function () {
        var result = Object.create(base);
        result.references = {};
        return result;
    };
})();

var generate = exports.generate = function (template, input) {
    var context = createContext();
    return engine.create(documentLevel.ccd, input, context);
};

exports.generateCCD = function (input) {
    var data = input.data ? input.data : input;
    data.identifiers = input.meta && input.meta.identifiers;
    return generate(documentLevel.ccd, data);
};

},{"./lib/documentLevel":5,"./lib/engine":6}],3:[function(require,module,exports){
"use strict";

exports.keyExists = function (key) {
    return function (input) {
        return input.hasOwnProperty(key);
    };
};

exports.eitherKeyExists = function (key0, key1, key2, key3) {
    return function (input) {
        return input[key0] || input[key1] || input[key2] || input[key3];
    };
};

exports.codeOrDisplayname = function (input) {
    return input.code || input.name;
};

exports.propertyEquals = function (property, value) {
    return function (input) {
        return input && (input[property] === value);
    };
};

},{}],4:[function(require,module,exports){
"use strict";

exports.key = function (overrideKeyValue) {
    return function (template) {
        template.key = overrideKeyValue;
    };
};

exports.required = function (template) {
    template.required = true;
};

exports.dataKey = function (overrideKeyValue) {
    return function (template) {
        template.dataKey = overrideKeyValue;
    };
};

},{}],5:[function(require,module,exports){
"use strict";

var headerLevel = require('./headerLevel');
var fieldLevel = require('./fieldLevel');
var sectionLevel = require('./sectionLevel');
var contentModifier = require("./contentModifier");

var required = contentModifier.required;

exports.ccd = {
    key: "ClinicalDocument",
    attributes: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns": "urn:hl7-org:v3",
        "xmlns:cda": "urn:hl7-org:v3",
        "xmlns:sdtc": "urn:hl7-org:sdtc"
    },
    content: [{
            key: "realmCode",
            attributes: {
                code: "US"
            }
        }, {
            key: "typeId",
            attributes: {
                root: "2.16.840.1.113883.1.3",
                extension: "POCD_HD000040"
            }
        },
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.1.1"),
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.1.2"),
        fieldLevel.id, {
            key: "code",
            attributes: {
                codeSystem: "2.16.840.1.113883.6.1",
                codeSystemName: "LOINC",
                code: "34133-9",
                displayName: "Summarization of Episode Note"
            }
        }, {
            key: "title",
            text: "Community Health and Hospitals: Health Summary"
        },
        [fieldLevel.effectiveTime, required], {
            key: "confidentialityCode",
            attributes: {
                code: "N",
                codeSystem: "2.16.840.1.113883.5.25"
            }
        }, {
            key: "languageCode",
            attributes: {
                code: "en-US"
            }
        }, {
            key: "setId",
            attributes: {
                extension: "sTT988",
                root: "2.16.840.1.113883.19.5.99999.19"
            }
        }, {
            key: "versionNumber",
            attributes: {
                value: "1"
            }
        },
        headerLevel.recordTarget, {
            key: "component",
            content: {
                key: "structuredBody",
                content: [
                    [sectionLevel.allergiesSectionEntriesRequired, required],
                    [sectionLevel.medicationsSectionEntriesRequired, required],
                    [sectionLevel.problemsSectionEntriesRequired, required],
                    [sectionLevel.proceduresSectionEntriesRequired, required],
                    [sectionLevel.resultsSectionEntriesRequired, required],
                    sectionLevel.encountersSectionEntriesOptional,
                    sectionLevel.immunizationsSectionEntriesOptional,
                    sectionLevel.payersSection,
                    sectionLevel.planOfCareSection,
                    sectionLevel.socialHistorySection,
                    sectionLevel.vitalSignsSectionEntriesOptional
                ],
                notImplemented: [
                    "advanceDirectivesSectionEntriesOptional",
                    "familyHistorySection",
                    "functionalStatusSection",
                    "medicalEquipmentSection",
                ]
            }
        }
    ]
};

},{"./contentModifier":4,"./fieldLevel":20,"./headerLevel":21,"./sectionLevel":23}],6:[function(require,module,exports){
"use strict";

var xmlutil = require('./xmlutil');

var expandText = function (input, template) {
    var text = template.text;
    if (text) {
        if (typeof text === 'function') {
            text = text(input);
        }
        if (text) {
            return text;
        }
    }
    return null;
};

var expandAttributes = function expandAttributes(input, context, attrObj, attrs) {
    if (Array.isArray(attrObj)) {
        attrObj.forEach(function (attrObjElem) {
            expandAttributes(input, context, attrObjElem, attrs);
        });
    } else if (typeof attrObj === 'function') {
        expandAttributes(input, context, attrObj(input, context), attrs);
    } else {
        Object.keys(attrObj).forEach(function (attrKey) {
            var attrVal = attrObj[attrKey];
            if (typeof attrVal === 'function') {
                attrVal = attrVal(input, context);
            }
            if ((attrVal !== null) && (attrVal !== undefined)) {
                attrs[attrKey] = attrVal;
            }
        });
    }
};

var fillAttributes = function (node, input, context, template) {
    var attrObj = template.attributes;
    if (attrObj) {
        var inputAttrKey = template.attributeKey;
        if (inputAttrKey) {
            input = input[inputAttrKey];
        }
        if (input) {
            var attrs = {};
            expandAttributes(input, context, attrObj, attrs);
            xmlutil.nodeAttr(node, attrs);
        }
    }
};

var update;

var fillContent = function (node, input, context, template) {
    var content = template.content;
    if (content) {
        if (!Array.isArray(content)) {
            content = [content];
        }
        content.forEach(function (element) {
            if (Array.isArray(element)) {
                var actualElement = Object.create(element[0]);
                for (var i = 1; i < element.length; ++i) {
                    element[i](actualElement);
                }
                update(node, input, context, actualElement);
            } else {
                update(node, input, context, element);
            }
        });
    }
};

var updateUsingTemplate = function updateUsingTemplate(xmlDoc, input, context, template) {
    var condition = template.existsWhen;
    if ((!condition) || condition(input)) {
        var name = template.key;
        var text = expandText(input, template);
        if (text || template.content || template.attributes) {
            var node = xmlutil.newNode(xmlDoc, name, text);

            fillAttributes(node, input, context, template);
            fillContent(node, input, context, template);
            return true;
        }
    }
    return false;
};

var transformInput = function (input, template) {
    var inputKey = template.dataKey;
    if (inputKey) {
        var pieces = inputKey.split('.');
        pieces.forEach(function (piece) {
            input = input && input[piece];
        });
    }
    if (input) {
        var transform = template.dataTransform;
        if (transform) {
            input = transform(input);
        }
    }
    return input;
};

update = exports.update = function (xmlDoc, input, context, template) {
    var filled = false;
    if (input) {
        input = transformInput(input, template);
        if (input) {
            if (Array.isArray(input)) {
                input.forEach(function (element) {
                    filled = updateUsingTemplate(xmlDoc, element, context, template) || filled;
                });
            } else {
                filled = updateUsingTemplate(xmlDoc, input, context, template);
            }
        }
    }
    if ((!filled) && template.required) {
        var node = xmlutil.newNode(xmlDoc, template.key);
        xmlutil.nodeAttr(node, {
            nullFlavor: 'UNK'
        });
    }
};

exports.create = function (template, input, context) {
    var doc = new xmlutil.newDocument();
    update(doc, input, context, template);
    var result = xmlutil.serializeToString(doc);
    return result;
};

},{"./xmlutil":1}],7:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require('../condition');
var contentModifier = require("../contentModifier");

var sel = require("./sharedEntryLevel");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

var allergyStatusObservation = {
    key: "observation",
    attributes: {
        "classCode": "OBS",
        "moodCode": "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.28"),
        fieldLevel.templateCode("AllergyStatusObservation"),
        fieldLevel.statusCodeCompleted, {
            key: "value",
            attributes: [
                leafLevel.typeCE,
                leafLevel.code
            ],
            existsWhen: condition.codeOrDisplayname,
            required: true
        }
    ],
    dataKey: "status"
};

var allergyIntoleranceObservation = exports.allergyIntoleranceObservation = {
    key: "observation",
    attributes: {
        "classCode": "OBS",
        "moodCode": "EVN",
        "negationInd": leafLevel.boolInputProperty("negation_indicator")
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.7"),
        fieldLevel.id,
        fieldLevel.templateCode("AllergyObservation"),
        fieldLevel.statusCodeCompleted, [fieldLevel.effectiveTime, required], {
            key: "value",
            attributes: [
                leafLevel.typeCD,
                leafLevel.code
            ],
            content: {
                key: "originalText",
                content: {
                    key: "reference",
                    attributes: {
                        "value": leafLevel.nextReference("reaction")
                    }
                }
            },
            dataKey: 'intolerance',
            existsWhen: condition.codeOrDisplayname,
            required: true
        }, {
            key: "participant",
            attributes: {
                "typeCode": "CSM"
            },
            content: [{
                key: "participantRole",
                attributes: {
                    "classCode": "MANU"
                },
                content: [{
                    key: "playingEntity",
                    attributes: {
                        classCode: "MMAT"
                    },
                    content: [{
                        key: "code",
                        attributes: leafLevel.code,
                        content: [{
                            key: "originalText",
                            content: [{
                                key: "reference",
                                attributes: {
                                    "value": leafLevel.sameReference("reaction")
                                }
                            }]
                        }, {
                            key: "translation",
                            attributes: leafLevel.code,
                            dataKey: "translations"
                        }],
                        require: true
                    }]
                }],
                required: true
            }],
            dataKey: 'allergen'
        }, {
            key: "entryRelationship",
            attributes: {
                "typeCode": "SUBJ",
                "inversionInd": "true"
            },
            content: [
                [allergyStatusObservation, required]
            ],
            existsWhen: condition.keyExists("status")
        }, {
            key: "entryRelationship",
            attributes: {
                "typeCode": "MFST",
                "inversionInd": "true"
            },
            content: [
                [sel.reactionObservation, required]
            ],
            dataKey: 'reactions',
            existsWhen: condition.keyExists('reaction')
        }, {
            key: "entryRelationship",
            attributes: {
                "typeCode": "SUBJ",
                "inversionInd": "true"
            },
            content: [
                [sel.severityObservation, required]
            ],
            existsWhen: condition.keyExists('severity')
        }
    ],
    dataKey: "observation",
    warning: [
        "negationInd attribute is not specified in specification"
    ]
};

var allergyProblemAct = exports.allergyProblemAct = {
    key: "act",
    attributes: {
        classCode: "ACT",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.30"),
        fieldLevel.id,
        fieldLevel.templateCode("AllergyProblemAct"),
        fieldLevel.statusCodeActive, [fieldLevel.effectiveTime, required], {
            key: "entryRelationship",
            attributes: {
                typeCode: "SUBJ",
                inversionInd: "true"
            },
            content: [allergyIntoleranceObservation, required],
            existsWhen: condition.keyExists('observation'),
            required: true,
            warning: "inversionInd is not in spec"
        }
    ],
    warning: "statusCode is not constant in spec"
};

},{"../condition":3,"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22,"./sharedEntryLevel":17}],8:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var contentModifier = require("../contentModifier");

var sharedEntryLevel = require("./sharedEntryLevel");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

exports.encounterActivities = {
    key: "encounter",
    attributes: {
        classCode: "ENC",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.49"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            content: [{
                key: "originalText",
                content: [{
                    key: "reference",
                    attributes: {
                        "value": leafLevel.nextReference("Encounter")
                    }
                }]
            }, {
                key: "translation",
                attributes: leafLevel.code,
                dataKey: "translations"
            }],
            dataKey: "encounter"
        },
        [fieldLevel.effectiveTime, required],
        [fieldLevel.performer, dataKey("performers")], {
            key: "participant",
            attributes: {
                typeCode: "LOC"
            },
            content: [
                [sharedEntryLevel.serviceDeliveryLocation, required]
            ],
            dataKey: "locations"
        }, {
            key: "entryRelationship",
            attributes: {
                typeCode: "RSON"
            },
            content: [
                [sharedEntryLevel.indication, required]
            ],
            dataKey: "findings",
            dataTransform: function (input) {
                input = input.map(function (e) {
                    e.code = {
                        code: "404684003",
                        name: "Finding",
                        code_system: "2.16.840.1.113883.6.96",
                        code_system_name: "SNOMED CT"
                    };
                    return e;
                });
                return input;
            },
            toDo: "move dataTransform to blue-button-meta"
        }
    ],
    notImplemented: [
        "entryRelationship:encounterDiagnosis",
        "dishargeDispositionCode"
    ]
};

},{"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22,"./sharedEntryLevel":17}],9:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require("../condition");
var contentModifier = require("../contentModifier");

var sharedEntryLevel = require("./sharedEntryLevel");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

var immunizationMedicationInformation = {
    key: "manufacturedProduct",
    attributes: {
        classCode: "MANU"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.54"),
        fieldLevel.id, {
            key: "manufacturedMaterial",
            content: [{
                key: "code",
                attributes: leafLevel.code,
                content: [{
                    key: "originalText",
                    text: leafLevel.inputProperty("unencoded_name"),
                    content: {
                        key: "reference",
                        attributes: {
                            "value": leafLevel.nextReference("imminfo")
                        }
                    }
                }, {
                    key: "translation",
                    attributes: leafLevel.code,
                    dataKey: "translations"
                }]
            }, {
                key: "lotNumberText",
                text: leafLevel.input,
                dataKey: "lot_number"
            }],
            dataKey: "product",
            required: true
        }, {
            key: "manufacturerOrganization",
            content: {
                key: "name",
                text: leafLevel.input,
            },
            dataKey: "manufacturer"
        }
    ],
    dataTransform: function (input) {
        if (input.product) {
            input.product.lot_number = input.lot_number;
        }
        return input;
    }
};

var immunizationRefusalReason = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.53"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.codeFromName("2.16.840.1.113883.5.8"),
            required: true
        },
        fieldLevel.statusCodeCompleted
    ]
};

var immunizationActivityAttributes = function (input) {
    if (input.status) {
        if (input.status === "refused") {
            return {
                moodCode: "EVN",
                negationInd: "true"
            };
        }
        if (input.status === "pending") {
            return {
                moodCode: "INT",
                negationInd: "false"
            };
        }
        if (input.status === "complete") {
            return {
                moodCode: "EVN",
                negationInd: "false"
            };
        }
    }
    return null;
};

exports.immunizationActivity = {
    key: "substanceAdministration",
    attributes: [{
        classCode: "SBADM"
    }, immunizationActivityAttributes],
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.52"),
        fieldLevel.id,
        fieldLevel.text(leafLevel.nextReference("immunization")),
        fieldLevel.statusCodeCompleted, [fieldLevel.effectiveTime, required], {
            key: "repeatNumber",
            attributes: {
                value: leafLevel.inputProperty("sequence_number")
            },
            existsWhen: function (input) {
                return input.sequence_number || (input.sequence_number === "");
            }
        }, {
            key: "routeCode",
            attributes: leafLevel.code,
            dataKey: "administration.route"
        }, {
            key: "approachSiteCode",
            attributes: leafLevel.code,
            dataKey: "administration.body_site"
        }, {
            key: "doseQuantity",
            attributes: {
                value: leafLevel.inputProperty("value"),
                unit: leafLevel.inputProperty("unit")
            },
            dataKey: "administration.dose"
        }, {
            key: "consumable",
            content: [
                [immunizationMedicationInformation, required]
            ],
            dataKey: "product",
            required: true
        },
        fieldLevel.performer, {
            key: "entryRelationship",
            attributes: {
                typeCode: "SUBJ",
                inversionInd: "true"
            },
            content: [sharedEntryLevel.instructions, required],
            dataKey: "instructions"
        }, {
            key: "entryRelationship",
            attributes: {
                typeCode: "RSON"
            },
            content: [immunizationRefusalReason, required],
            dataKey: "refusal_reason"
        }
    ],
    notImplemented: [
        "code",
        "administrationUnitCode",
        "participant:drugVehicle",
        "entryRelationship:indication",
        "entryRelationship:medicationSupplyOrder",
        "entryRelationship:medicationDispense",
        "entryRelationship:reactionObservation",
        "entryRelationship:preconditionForSubstanceAdministration"
    ]
};

},{"../condition":3,"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22,"./sharedEntryLevel":17}],10:[function(require,module,exports){
"use strict";

var allergyEntryLevel = require("./allergyEntryLevel");
var resultEntryLevel = require("./resultEntryLevel");
var socialHistoryEntryLevel = require('./socialHistoryEntryLevel');
var payerEntryLevel = require('./payerEntryLevel');
var vitalSignEntryLevel = require('./vitalSignEntryLevel');
var planOfCareEntryLevel = require('./planOfCareEntryLevel');
var procedureEntryLevel = require("./procedureEntryLevel");
var problemEntryLevel = require("./problemEntryLevel");
var encounterEntryLevel = require("./encounterEntryLevel");
var immunizationEntryLevel = require("./immunizationEntryLevel");
var medicationEntryLevel = require("./medicationEntryLevel");

exports.allergyProblemAct = allergyEntryLevel.allergyProblemAct;

exports.medicationActivity = medicationEntryLevel.medicationActivity;

exports.immunizationActivity = immunizationEntryLevel.immunizationActivity;

exports.problemConcernAct = problemEntryLevel.problemConcernAct;

exports.encounterActivities = encounterEntryLevel.encounterActivities;

exports.procedureActivityAct = procedureEntryLevel.procedureActivityAct;
exports.procedureActivityProcedure = procedureEntryLevel.procedureActivityProcedure;
exports.procedureActivityObservation = procedureEntryLevel.procedureActivityObservation;

exports.planOfCareActivityAct = planOfCareEntryLevel.planOfCareActivityAct;
exports.planOfCareActivityObservation = planOfCareEntryLevel.planOfCareActivityObservation;
exports.planOfCareActivityProcedure = planOfCareEntryLevel.planOfCareActivityProcedure;
exports.planOfCareActivityEncounter = planOfCareEntryLevel.planOfCareActivityEncounter;
exports.planOfCareActivitySubstanceAdministration = planOfCareEntryLevel.planOfCareActivitySubstanceAdministration;
exports.planOfCareActivitySupply = planOfCareEntryLevel.planOfCareActivitySupply;
exports.planOfCareActivityInstructions = planOfCareEntryLevel.planOfCareActivityInstructions;

exports.coverageActivity = payerEntryLevel.coverageActivity;

exports.vitalSignsOrganizer = vitalSignEntryLevel.vitalSignsOrganizer;

exports.resultOrganizer = resultEntryLevel.resultOrganizer;

exports.socialHistoryObservation = socialHistoryEntryLevel.socialHistoryObservation;
exports.smokingStatusObservation = socialHistoryEntryLevel.smokingStatusObservation;

},{"./allergyEntryLevel":7,"./encounterEntryLevel":8,"./immunizationEntryLevel":9,"./medicationEntryLevel":11,"./payerEntryLevel":12,"./planOfCareEntryLevel":13,"./problemEntryLevel":14,"./procedureEntryLevel":15,"./resultEntryLevel":16,"./socialHistoryEntryLevel":18,"./vitalSignEntryLevel":19}],11:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require("../condition");
var contentModifier = require("../contentModifier");

var sharedEntryLevel = require("./sharedEntryLevel");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

var medicationInformation = {
    key: "manufacturedProduct",
    attributes: {
        classCode: "MANU"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.23"),
        fieldLevel.id, {
            key: "manufacturedMaterial",
            content: [{
                key: "code",
                attributes: leafLevel.code,
                content: [{
                    key: "originalText",
                    text: leafLevel.inputProperty("unencoded_name"),
                    content: [{
                        key: "reference",
                        attributes: {
                            "value": leafLevel.nextReference("medinfo")
                        }
                    }]
                }, {
                    key: "translation",
                    attributes: leafLevel.code,
                    dataKey: "translations"
                }]
            }],
            dataKey: "product",
            required: true
        }, {
            key: "manufacturerOrganization",
            content: {
                key: "name",
                text: leafLevel.input,
            },
            dataKey: "manufacturer"
        }
    ],
    dataTransform: function (input) {
        if (input.product) {
            input.product.unencoded_name = input.unencoded_name;
        }
        return input;
    }
};

var medicationSupplyOrder = {
    key: "supply",
    attributes: {
        classCode: "SPLY",
        moodCode: "INT"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.17"),
        fieldLevel.id,
        fieldLevel.statusCodeCompleted,
        fieldLevel.effectiveTime, {
            key: "repeatNumber",
            attributes: {
                value: leafLevel.input
            },
            dataKey: "repeatNumber"
        }, {
            key: "quantity",
            attributes: {
                value: leafLevel.input
            },
            dataKey: "quantity"
        }, {
            key: "product",
            content: medicationInformation,
            dataKey: "product"
        },
        fieldLevel.author, {
            key: "entryRelationship",
            attributes: {
                typeCode: "SUBJ",
                inversionInd: "true"
            },
            content: [
                [sharedEntryLevel.instructions, required]
            ],
            dataKey: "instructions"
        }
    ],
    toDo: "statusCode needs to allow values other than completed",
    notImplemented: [
        "product:immunizationMedicationInformation"
    ]
};

var medicationDispense = {
    key: "supply",
    attributes: {
        classCode: "SPLY",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.18"),
        fieldLevel.id,
        fieldLevel.statusCodeCompleted,
        fieldLevel.effectiveTime, {
            key: "product",
            content: medicationInformation,
            dataKey: "product"
        },
        fieldLevel.performer
    ],
    toDo: "statusCode needs to allow different values than completed",
    notImplemented: [
        "repeatNumber",
        "quantity",
        "product:ImmunizationMedicationInformation",
        "entryRelationship:medicationSupplyOrder",
    ]
};

exports.medicationActivity = {
    key: "substanceAdministration",
    attributes: {
        classCode: "SBADM",
        moodCode: function (input) {
            var status = input.status;
            if (status) {
                if (status === 'Prescribed') {
                    return 'INT';
                }
                if (status === 'Completed') {
                    return 'EVN';
                }
            }
            return null;
        }
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.16"),
        fieldLevel.id, {
            key: "text",
            text: leafLevel.input,
            dataKey: "sig"
        },
        fieldLevel.statusCodeCompleted, [fieldLevel.effectiveTime, required], {
            key: "effectiveTime",
            attributes: {
                "xsi:type": "PIVL_TS",
                "institutionSpecified": "true",
                "operator": "A"
            },
            content: {
                key: "period",
                attributes: {
                    value: leafLevel.inputProperty("value"),
                    unit: leafLevel.inputProperty("unit")
                },
            },
            dataKey: "administration.interval.period",
        }, {
            key: "routeCode",
            attributes: leafLevel.code,
            dataKey: "administration.route"
        }, {
            key: "doseQuantity",
            attributes: {
                value: leafLevel.inputProperty("value"),
                unit: leafLevel.inputProperty("unit")
            },
            dataKey: "administration.dose"
        }, {
            key: "rateQuantity",
            attributes: {
                value: leafLevel.inputProperty("value"),
                unit: leafLevel.inputProperty("unit")
            },
            dataKey: "administration.rate"
        }, {
            key: "administrationUnitCode",
            attributes: leafLevel.code,
            dataKey: "administration.form"
        }, {
            key: "consumable",
            content: medicationInformation,
            dataKey: "product"
        },
        fieldLevel.performer, {
            key: "participant",
            attributes: {
                typeCode: "CSM"
            },
            content: [
                [sharedEntryLevel.drugVehicle, required]
            ],
            dataKey: "drug_vehicle"
        }, {
            key: "entryRelationship",
            attributes: {
                typeCode: "RSON"
            },
            content: [
                [sharedEntryLevel.indication, required]
            ],
            dataKey: "indication"
        }, {
            key: "entryRelationship",
            attributes: {
                typeCode: "REFR"
            },
            content: [
                [medicationSupplyOrder, required]
            ],
            dataKey: "supply"
        }, {
            key: "entryRelationship",
            attributes: {
                typeCode: "REFR"
            },
            content: [
                [medicationDispense, required]
            ],
            dataKey: "dispense"
        }, {
            key: "precondition",
            attributes: {
                typeCode: "PRCN"
            },
            content: [
                fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.25"), [sharedEntryLevel.preconditionForSubstanceAdministration, required]
            ],
            dataKey: "precondition",
            warning: "templateId needs to be in preconditionForSubstanceAdministration but CCD_1.xml contradicts"
        }
    ],
    notImplemented: [
        "code",
        "text:reference",
        "repeatNumber",
        "approachSiteCode",
        "maxDoseQuantity",
        "entryRelationship:instructions",
        "reactionObservation"
    ]
};

},{"../condition":3,"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22,"./sharedEntryLevel":17}],12:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require("../condition");
var contentModifier = require("../contentModifier");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

var policyActivity = {
    key: "act",
    attributes: {
        classCode: "ACT",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.61"),
        fieldLevel.statusCodeCompleted, {
            key: "id",
            attributes: {
                root: leafLevel.inputProperty("identifier"),
                extension: leafLevel.inputProperty("extension")
            },
            dataKey: 'policy.identifiers',
            existsWhen: condition.keyExists('identifier'),
            required: true
        }, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "policy.code"
        }, {
            key: "performer",
            attributes: {
                typeCode: "PRF"
            },
            content: [
                fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.87"),
                fieldLevel.assignedEntity
            ],
            dataKey: "policy.insurance.performer"
        }, {
            key: "performer",
            attributes: {
                typeCode: "PRF"
            },
            content: [
                fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.88"),
                fieldLevel.assignedEntity
            ],
            dataKey: "guarantor"
        }, {
            key: "participant",
            attributes: {
                typeCode: "COV"
            },
            content: [
                fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.89"), [fieldLevel.effectiveTime, key("time")], {
                    key: "participantRole",
                    attributes: {
                        classCode: "PAT"
                    },
                    content: [
                        fieldLevel.id,
                        fieldLevel.usRealmAddress,
                        fieldLevel.telecom, {
                            key: "code",
                            attributes: leafLevel.code,
                            dataKey: "code"
                        }, {
                            key: "playingEntity",
                            content: fieldLevel.usRealmName
                        }
                    ]
                }
            ],
            dataKey: "participant",
            dataTransform: function (input) {
                if (input.performer) {
                    input.identifiers = input.performer.identifiers;
                    input.address = input.performer.address;
                    input.phone = input.performer.phone;
                }
                return input;
            }
        }, {
            key: "participant",
            attributes: {
                typeCode: "HLD"
            },
            content: [
                fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.90"), {
                    key: "participantRole",
                    content: [
                        fieldLevel.id,
                        fieldLevel.usRealmAddress
                    ],
                    dataKey: "performer"
                }
            ],
            dataKey: "policy_holder"
        }, {
            key: "entryRelationship",
            attributes: {
                typeCode: "REFR"
            },
            content: {
                key: "act",
                attributes: {
                    classCode: "ACT",
                    moodCode: "EVN"
                },
                content: [
                    fieldLevel.templateId("2.16.840.1.113883.10.20.1.19"),
                    fieldLevel.id, {
                        key: "entryRelationship",
                        attributes: {
                            typeCode: "SUBJ"
                        },
                        content: {
                            key: "procedure",
                            attributes: {
                                classCode: "PROC",
                                moodCode: "PRMS"
                            },
                            content: {
                                key: "code",
                                attributes: leafLevel.code,
                                dataKey: "code"
                            }
                        },
                        dataKey: "procedure"
                    }
                ]
            },
            dataKey: "authorization"
        }
    ]
};

exports.coverageActivity = {
    key: "act",
    attributes: {
        classCode: "ACT",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.60"),
        fieldLevel.id,
        fieldLevel.templateCode("CoverageActivity"),
        fieldLevel.statusCodeCompleted, {
            key: "entryRelationship",
            attributes: {
                typeCode: "COMP"
            },
            content: [
                [policyActivity, required]
            ],
            required: true
        }
    ]
};

},{"../condition":3,"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22}],13:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require("../condition");
var contentModifier = require("../contentModifier");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

exports.planOfCareActivityAct = {
    key: "act",
    attributes: {
        classCode: "ACT",
        moodCode: "RQO"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.39"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "plan"
        },
        fieldLevel.statusCodeNew,
        fieldLevel.effectiveTime
    ],
    existsWhen: function (input) {
        return input.type === "act";
    }
};

exports.planOfCareActivityObservation = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "RQO"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.44"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "plan"
        },
        fieldLevel.statusCodeNew,
        fieldLevel.effectiveTime
    ],
    existsWhen: function (input) {
        return input.type === "observation";
    }
};

exports.planOfCareActivityProcedure = {
    key: "procedure",
    attributes: {
        classCode: "PROC",
        moodCode: "RQO"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.41"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "plan"
        },
        fieldLevel.statusCodeNew,
        fieldLevel.effectiveTime
    ],
    existsWhen: function (input) {
        return input.type === "procedure";
    }
};

exports.planOfCareActivityEncounter = {
    key: "encounter",
    attributes: {
        classCode: "ENC",
        moodCode: "INT"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.40"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "plan"
        },
        fieldLevel.statusCodeNew,
        fieldLevel.effectiveTime
    ],
    existsWhen: function (input) {
        return input.type === "encounter";
    }
};

exports.planOfCareActivitySubstanceAdministration = {
    key: "substanceAdministration",
    attributes: {
        classCode: "SBADM",
        moodCode: "RQO"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.42"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "plan"
        },
        fieldLevel.statusCodeNew,
        fieldLevel.effectiveTime
    ],
    existsWhen: function (input) {
        return input.type === "substanceAdministration";
    }
};

exports.planOfCareActivitySupply = {
    key: "supply",
    attributes: {
        classCode: "SPLY",
        moodCode: "INT"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.43"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "plan"
        },
        fieldLevel.statusCodeNew,
        fieldLevel.effectiveTime
    ],
    existsWhen: function (input) {
        return input.type === "supply";
    }
};

exports.planOfCareActivityInstructions = {
    key: "instructions",
    attributes: {
        classCode: "ACT",
        moodCode: "INT"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.20"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "plan"
        },
        fieldLevel.statusCodeNew,
        fieldLevel.effectiveTime
    ],
    existsWhen: function (input) {
        return input.type === "instructions";
    }
};

},{"../condition":3,"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22}],14:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require("../condition");
var contentModifier = require("../contentModifier");

var sharedEntryLevel = require("./sharedEntryLevel");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

var problemStatus = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.6"),
        fieldLevel.id,
        fieldLevel.templateCode("ProblemStatus"),
        fieldLevel.statusCodeCompleted,
        fieldLevel.effectiveTime, {
            key: "value",
            attributes: [{
                    "xsi:type": "CD"
                },
                leafLevel.codeFromName("2.16.840.1.113883.3.88.12.80.68")
            ],
            dataKey: "name",
            required: true
        }
    ],
    warning: "effectiveTime does not exist in the specification"
};

var healthStatusObservation = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.5"),
        fieldLevel.templateCode("HealthStatusObservation"),
        fieldLevel.text(leafLevel.nextReference("healthStatus")),
        fieldLevel.statusCodeCompleted, {
            key: "value",
            attributes: {
                "xsi:type": "CD",
                code: "81323004",
                codeSystem: "2.16.840.1.113883.6.96",
                codeSystemName: "SNOMED CT",
                displayName: leafLevel.inputProperty("patient_status")
            },
            required: true,
            toDo: "The attribute should not be constant"
        }
    ]
};

var problemObservation = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN",
        negationInd: leafLevel.boolInputProperty("negation_indicator")
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.4"),
        fieldLevel.id,
        fieldLevel.text(leafLevel.nextReference("problem")),
        fieldLevel.statusCodeCompleted, [fieldLevel.effectiveTime, dataKey("problem.date_time")], {
            key: "value",
            attributes: [{
                    "xsi:type": "CD"
                },
                leafLevel.code
            ],
            content: [{
                key: "translation",
                attributes: leafLevel.code,
                dataKey: "translations"
            }],
            dataKey: "problem.code",
            existsWhen: condition.codeOrDisplayname,
            required: true
        }, {
            key: "entryRelationship",
            attributes: {
                typeCode: "REFR"
            },
            content: [
                [problemStatus, required]
            ],
            dataTransform: function (input) {
                if (input && input.status) {
                    var result = input.status;
                    result.identifiers = input.identifiers;
                    return result;
                }
                return null;
            }
        }, {
            key: "entryRelationship",
            attributes: {
                typeCode: "SUBJ",
                inversionInd: "true"
            },
            content: [
                [sharedEntryLevel.ageObservation, required]
            ],
            existsWhen: condition.keyExists("onset_age")
        }, {
            key: "entryRelationship",
            attributes: {
                typeCode: "REFR"
            },
            content: [
                [healthStatusObservation, required]
            ],
            existsWhen: condition.keyExists("patient_status")
        }
    ],
    notImplemented: [
        "code"
    ]
};

exports.problemConcernAct = {
    key: "act",
    attributes: {
        classCode: "ACT",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.3"),
        fieldLevel.templateCode("ProblemConcernAct"), {
            key: "id",
            attributes: {
                root: leafLevel.inputProperty("identifier"),
                extension: leafLevel.inputProperty("extension")
            },
            dataKey: 'source_list_identifiers',
            existsWhen: condition.keyExists('identifier'),
            required: true
        },
        fieldLevel.statusCodeCompleted, [fieldLevel.effectiveTime, required], {
            key: "entryRelationship",
            attributes: {
                typeCode: "SUBJ"
            },
            content: [
                [problemObservation, required]
            ],
            required: true
        }
    ]
};

},{"../condition":3,"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22,"./sharedEntryLevel":17}],15:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require("../condition");
var contentModifier = require("../contentModifier");

var sharedEntryLevel = require("./sharedEntryLevel");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

exports.procedureActivityAct = {
    key: "act",
    attributes: {
        classCode: "ACT",
        moodCode: "INT" // not constant in the specification
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.12"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            content: [{
                key: "originalText",
                content: [{
                    key: "reference",
                    attributes: {
                        "value": leafLevel.nextReference("procedure")
                    }
                }]
            }],
            dataKey: "procedure",
            required: true
        }, {
            key: "statusCode",
            attributes: leafLevel.codeFromName("2.16.840.1.113883.11.20.9.22"),
            dataKey: "status",
            required: true
        },
        fieldLevel.effectiveTime, {
            key: "priorityCode",
            attributes: leafLevel.code,
            dataKey: "priority"
        }, {
            key: "targetSiteCode",
            attributes: leafLevel.code,
            dataKey: "body_sites"
        },
        fieldLevel.performer, {
            key: "participant",
            attributes: {
                typeCode: "LOC"
            },
            content: [
                [sharedEntryLevel.serviceDeliveryLocation, required]
            ],
            dataKey: "locations"
        }
    ],
    existsWhen: condition.propertyEquals("procedure_type", "act"),
    toDo: ["moodCode should be variable"],
    notImplemented: [
        "entryRelationship:encounter",
        "entryRelationship:indication",
        "entryRelationship:medicationActivity"
    ]
};

exports.procedureActivityProcedure = {
    key: "procedure",
    attributes: {
        classCode: "PROC",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.14"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            content: [{
                key: "originalText",
                content: [{
                    key: "reference",
                    attributes: {
                        "value": leafLevel.nextReference("procedure")
                    }
                }]
            }],
            dataKey: "procedure",
            required: true
        }, {
            key: "statusCode",
            attributes: leafLevel.codeFromName("2.16.840.1.113883.11.20.9.22"),
            dataKey: "status",
            required: true
        },
        fieldLevel.effectiveTime, {
            key: "priorityCode",
            attributes: leafLevel.code,
            dataKey: "priority"
        }, {
            key: "targetSiteCode",
            attributes: leafLevel.code,
            dataKey: "body_sites"
        }, {
            key: "specimen",
            attributes: {
                typeCode: "SPC"
            },
            content: {
                key: "specimenRole",
                attributes: {
                    classCode: "SPEC"
                },
                content: [
                    fieldLevel.id, {
                        key: "specimenPlayingEntity",
                        content: {
                            key: "code",
                            attributes: leafLevel.code,
                            dataKey: "code"
                        },
                        existsWhen: condition.keyExists("code")
                    }
                ],
                required: true
            },
            dataKey: "specimen"
        },
        fieldLevel.performer, {
            key: "participant",
            attributes: {
                typeCode: "LOC"
            },
            content: [
                [sharedEntryLevel.serviceDeliveryLocation, required]
            ],
            dataKey: "locations"
        }
    ],
    existsWhen: condition.propertyEquals("procedure_type", "procedure"),
    toDo: ["moodCode should be variable"],
    notImplemented: [
        "methodCode",
        "participant:productInstance",
        "entryRelationship:encounter",
        "entryRelationship:instructions",
        "entryRelationship:indication",
        "entryRelationship:medicationActivity"
    ]
};

exports.procedureActivityObservation = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN" // not constant in the specification
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.13"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            content: [{
                key: "originalText",
                content: [{
                    key: "reference",
                    attributes: {
                        "value": leafLevel.nextReference("procedure")
                    }
                }]
            }],
            dataKey: "procedure",
            required: true
        }, {
            key: "statusCode",
            attributes: leafLevel.codeFromName("2.16.840.1.113883.11.20.9.22"),
            dataKey: "status",
            required: true
        },
        fieldLevel.effectiveTime, {
            key: "priorityCode",
            attributes: leafLevel.code,
            dataKey: "priority"
        }, {
            key: "value",
            attributes: {
                "xsi:type": "CD"
            }
        }, {
            key: "targetSiteCode",
            attributes: leafLevel.code,
            dataKey: "body_sites"
        },
        fieldLevel.performer, {
            key: "participant",
            attributes: {
                typeCode: "LOC"
            },
            content: [
                [sharedEntryLevel.serviceDeliveryLocation, required]
            ],
            dataKey: "locations"
        }
    ],
    existsWhen: condition.propertyEquals("procedure_type", "observation"),
    toDo: ["moodCode should be variable"],
    notImplemented: [
        "entryRelationship:encounter",
        "entryRelationship:instructions",
        "entryRelationship:indication",
        "entryRelationship:medicationActivity"
    ]
};

},{"../condition":3,"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22,"./sharedEntryLevel":17}],16:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require("../condition");

var contentModifier = require("../contentModifier");

var required = contentModifier.required;

var resultObservation = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.2"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "result",
            required: true
        },
        fieldLevel.text(leafLevel.nextReference("result")),
        fieldLevel.statusCodeCompleted, [fieldLevel.effectiveTime, required], {
            key: "value",
            attributes: {
                "xsi:type": "PQ",
                value: leafLevel.inputProperty("value"),
                unit: leafLevel.inputProperty("unit")
            },
            existsWhen: condition.keyExists("value"),
            required: true
        }, {
            key: "interpretationCode",
            attributes: {
                code: function (input) {
                    return input.substr(0, 1);
                },
                codeSystem: "2.16.840.1.113883.5.83",
                displayName: leafLevel.input,
                codeSystemName: "ObservationInterpretation"
            },
            dataKey: "interpretations"
        }, {
            key: "referenceRange",
            content: {
                key: "observationRange",
                content: [{
                    key: "text",
                    text: leafLevel.input,
                    dataKey: "range"
                }, {
                    key: "value",
                    attributes: {
                        "xsi:type": "IVL_PQ"
                    },
                    content: [{
                        key: "low",
                        attributes: {
                            value: leafLevel.inputProperty("low"),
                            unit: leafLevel.inputProperty("unit")
                        },
                        existsWhen: condition.keyExists("low")
                    }, {
                        key: "high",
                        attributes: {
                            value: leafLevel.inputProperty("high"),
                            unit: leafLevel.inputProperty("unit")
                        },
                        existsWhen: condition.keyExists("high")
                    }],
                    existsWhen: condition.eitherKeyExists("low", "high")
                }],
                required: true
            },
            dataKey: "reference_range"
        }
    ],
    notIplemented: [
        "variable statusCode",
        "methodCode",
        "targetSiteCode",
        "author"
    ]
};

exports.resultOrganizer = {
    key: "organizer",
    attributes: {
        classCode: "BATTERY",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.1"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            content: {
                key: "translation",
                attributes: leafLevel.code,
                dataKey: "translations"
            },
            dataKey: "result_set",
            required: true
        },
        fieldLevel.statusCodeCompleted, {
            key: "component",
            content: [
                [resultObservation, required]
            ],
            dataKey: "results",
            required: true
        }
    ],
    notIplemented: [
        "variable @classCode",
        "variable statusCode"
    ]
};

},{"../condition":3,"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22}],17:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require('../condition');

var severityObservation = exports.severityObservation = {
    key: "observation",
    attributes: {
        "classCode": "OBS",
        "moodCode": "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.8"),
        fieldLevel.templateCode("SeverityObservation"),
        fieldLevel.text(leafLevel.nextReference("severity")),
        fieldLevel.statusCodeCompleted, {
            key: "value",
            attributes: [
                leafLevel.typeCD,
                leafLevel.code
            ],
            dataKey: "code",
            existsWhen: condition.codeOrDisplayname,
            required: true
        }, {
            key: "interpretationCode",
            attributes: leafLevel.code,
            dataKey: "interpretation",
            existsWhen: condition.codeOrDisplayname
        }
    ],
    dataKey: "severity",
    existsWhen: condition.keyExists("code")
};

var reactionObservation = exports.reactionObservation = {
    key: "observation",
    attributes: {
        "classCode": "OBS",
        "moodCode": "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.9"),
        fieldLevel.id,
        fieldLevel.nullFlavor("code"),
        fieldLevel.text(leafLevel.sameReference("reaction")),
        fieldLevel.statusCodeCompleted,
        fieldLevel.effectiveTime, {
            key: "value",
            attributes: [
                leafLevel.typeCD,
                leafLevel.code
            ],
            dataKey: 'reaction',
            existsWhen: condition.codeOrDisplayname,
            required: true
        }, {
            key: "entryRelationship",
            attributes: {
                "typeCode": "SUBJ",
                "inversionInd": "true"
            },
            content: severityObservation,
            existsWhen: condition.keyExists('severity')
        }
    ],
    notImplemented: [
        "Procedure Activity Procedure",
        "Medication Activity"
    ]
};

exports.serviceDeliveryLocation = {
    key: "participantRole",
    attributes: {
        classCode: "SDLOC"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.32"), {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "location_type",
            required: true
        },
        fieldLevel.usRealmAddress,
        fieldLevel.telecom, {
            key: "playingEntity",
            attributes: {
                classCode: "PLC"
            },
            content: {
                key: "name",
                text: leafLevel.inputProperty("name"),
            },
            existsWhen: condition.keyExists("name")
        }
    ]
};

exports.ageObservation = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.31"),
        fieldLevel.templateCode("AgeObservation"),
        fieldLevel.statusCodeCompleted, {
            key: "value",
            attributes: {
                "xsi:type": "PQ",
                value: leafLevel.inputProperty("onset_age"),
                unit: leafLevel.codeOnlyFromName("2.16.840.1.113883.11.20.9.21", "onset_age_unit")
            },
            required: true
        }
    ]
};

exports.indication = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.19"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            dataKey: "code",
            required: true
        },
        fieldLevel.statusCodeCompleted,
        fieldLevel.effectiveTime, {
            key: "value",
            attributes: [
                leafLevel.typeCD,
                leafLevel.code
            ],
            dataKey: "value",
            existsWhen: condition.codeOrDisplayname
        }
    ],
    notImplemented: [
        "value should handle nullFlavor=OTH and translation"
    ]
};

exports.preconditionForSubstanceAdministration = {
    key: "criterion",
    content: [{
        key: "code",
        attributes: {
            code: leafLevel.inputProperty("code"),
            codeSystem: "2.16.840.1.113883.5.4"
        },
        dataKey: "code"
    }, {
        key: "value",
        attributes: [
            leafLevel.typeCE, // TODO: spec has CD, spec example has CE
            leafLevel.code
        ],
        dataKey: "value",
        existsWhen: condition.codeOrDisplayname
    }],
    warning: [
        "value type is CE is example but CD in spec",
        "templateId should be here according to spec but per CCD_1 is put in the parent"
    ]
};

exports.drugVehicle = {
    key: "participantRole",
    attributes: {
        classCode: "MANU"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.24"), {
            key: "code",
            attributes: {
                code: "412307009",
                displayName: "drug vehicle",
                codeSystem: "2.16.840.1.113883.6.96",
                codeSystemName: "SNOMED CT"
            }
        }, {
            key: "playingEntity",
            attributes: {
                classCode: "MMAT"
            },
            content: [{
                key: "code",
                attributes: leafLevel.code,
                required: true
            }, {
                key: "name",
                text: leafLevel.inputProperty("name")
            }],
            required: true
        }
    ]
};

exports.instructions = {
    key: "act",
    attributes: {
        classCode: "ACT",
        moodCode: "INT"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.20"), {
            key: "code",
            attributes: [
                leafLevel.code
            ],
            dataKey: "code",
            required: true
        },
        fieldLevel.text(leafLevel.nextReference("instruction")),
        fieldLevel.statusCodeCompleted
    ]
};

},{"../condition":3,"../fieldLevel":20,"../leafLevel":22}],18:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');

var contentModifier = require("../contentModifier");

var required = contentModifier.required;

exports.socialHistoryObservation = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.38"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            content: [{
                key: "originalText",
                text: leafLevel.inputProperty("unencoded_name"),
                content: {
                    key: "reference",
                    attributes: {
                        "value": leafLevel.nextReference("social")
                    }
                }
            }, {
                key: "translation",
                attributes: leafLevel.code,
                dataKey: "translations"
            }],
            dataKey: "code",
        },
        fieldLevel.statusCodeCompleted,
        fieldLevel.effectiveTime, {
            key: "value",
            attributes: {
                "xsi:type": "ST"
            },
            text: leafLevel.inputProperty("value")
        }
    ],
    existsWhen: function (input) {
        return (!input.value) || input.value.indexOf("smoke") < 0;
    }
};

exports.smokingStatusObservation = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.78"),
        fieldLevel.id,
        fieldLevel.templateCode("SmokingStatusObservation"),
        fieldLevel.statusCodeCompleted, [fieldLevel.effectiveTime, required], {
            key: "value",
            attributes: [{
                    "xsi:type": "CD"
                },
                leafLevel.codeFromName("2.16.840.1.113883.11.20.9.38")
            ],
            required: true,
            dataKey: "value"
        }
    ],
    existsWhen: function (input) {
        return input.value && input.value.indexOf("smoke") > -1;
    }
};

},{"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22}],19:[function(require,module,exports){
"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var condition = require("../condition");

var contentModifier = require("../contentModifier");

var required = contentModifier.required;

var vitalSignObservation = {
    key: "observation",
    attributes: {
        classCode: "OBS",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.27"),
        fieldLevel.id, {
            key: "code",
            attributes: leafLevel.code,
            content: [{
                key: "originalText",
                content: {
                    key: "reference",
                    attributes: {
                        "value": leafLevel.nextReference("vital")
                    }
                }
            }, {
                key: "translation",
                attributes: leafLevel.code,
                dataKey: "translations"
            }],
            dataKey: "vital",
            required: true
        }, {
            key: "statusCode",
            attributes: {
                code: leafLevel.inputProperty("status")
            }
        },
        [fieldLevel.effectiveTime, required], {
            key: "value",
            attributes: {
                "xsi:type": "PQ",
                value: leafLevel.inputProperty("value"),
                unit: leafLevel.inputProperty("unit")
            },
            existsWhen: condition.keyExists("value"),
            required: true
        }, {
            key: "interpretationCode",
            attributes: leafLevel.codeFromName("2.16.840.1.113883.5.83"),
            dataKey: "interpretations"
        }
    ],
    notImplemented: [
        "constant statusCode",
        "methodCode",
        "targetSiteCode",
        "author"
    ]
};

exports.vitalSignsOrganizer = {
    key: "organizer",
    attributes: {
        classCode: "CLUSTER",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.26"),
        fieldLevel.id,
        fieldLevel.templateCode("VitalSignsOrganizer"), {
            key: "statusCode",
            attributes: {
                code: leafLevel.inputProperty("status")
            }
        },
        [fieldLevel.effectiveTime, required], {
            key: "component",
            content: vitalSignObservation,
            required: true
        }
    ],
    notImplemented: [
        "constant statusCode"
    ]
};

},{"../condition":3,"../contentModifier":4,"../fieldLevel":20,"../leafLevel":22}],20:[function(require,module,exports){
"use strict";

var bbm = require("blue-button-meta");

var condition = require("./condition");
var leafLevel = require("./leafLevel");
var translate = require("./translate");
var contentModifier = require("./contentModifier");

var templateCodes = bbm.CCDA.sections_entries_codes.codes;

var key = contentModifier.key;
var required = contentModifier.required;

exports.templateId = function (id) {
    return {
        key: "templateId",
        attributes: {
            "root": id
        }
    };
};

exports.templateCode = function (name) {
    var raw = templateCodes[name];
    var result = {
        key: "code",
        attributes: {
            code: raw.code,
            displayName: raw.name,
            codeSystem: raw.code_system,
            codeSystemName: raw.code_system_name
        }
    };
    return result;
};

exports.templateTitle = function (name) {
    var raw = templateCodes[name];
    var result = {
        key: "title",
        text: raw.name,
    };
    return result;
};

var id = exports.id = {
    key: "id",
    attributes: {
        root: leafLevel.inputProperty("identifier"),
        extension: leafLevel.inputProperty("extension")
    },
    dataKey: 'identifiers',
    existsWhen: condition.keyExists('identifier'),
    required: true
};

exports.statusCodeCompleted = {
    key: "statusCode",
    attributes: {
        code: 'completed'
    }
};

exports.statusCodeActive = {
    key: "statusCode",
    attributes: {
        code: 'active'
    }
};

exports.statusCodeNew = {
    key: "statusCode",
    attributes: {
        code: 'new'
    }
};

var effectiveTime = exports.effectiveTime = {
    key: "effectiveTime",
    attributes: {
        "value": leafLevel.time,
    },
    attributeKey: 'point',
    content: [{
        key: "low",
        attributes: {
            "value": leafLevel.time
        },
        dataKey: 'low',
    }, {
        key: "high",
        attributes: {
            "value": leafLevel.time
        },
        dataKey: 'high',
    }, {
        key: "center",
        attributes: {
            "value": leafLevel.time
        },
        dataKey: 'center',
    }],
    dataKey: 'date_time',
    existsWhen: condition.eitherKeyExists('point', 'low', 'high', 'center')
};

exports.text = function (referenceMethod) {
    return {
        key: "text",
        text: leafLevel.inputProperty("free_text"),
        content: {
            key: "reference",
            attributes: {
                "value": referenceMethod
            },
        }
    };
};

exports.nullFlavor = function (name) {
    return {
        key: name,
        attributes: {
            nullFlavor: "UNK"
        }
    };
};

var usRealmAddress = exports.usRealmAddress = {
    key: "addr",
    attributes: {
        use: leafLevel.use("use")
    },
    content: [{
        key: "country",
        text: leafLevel.inputProperty("country")
    }, {
        key: "state",
        text: leafLevel.inputProperty("state")
    }, {
        key: "city",
        text: leafLevel.inputProperty("city")
    }, {
        key: "postalCode",
        text: leafLevel.inputProperty("zip")
    }, {
        key: "streetAddressLine",
        text: leafLevel.input,
        dataKey: "street_lines"
    }],
    dataKey: "address"
};

var usRealmName = exports.usRealmName = {
    key: "name",
    content: [{
        key: "family",
        text: leafLevel.inputProperty("family")
    }, {
        key: "given",
        text: leafLevel.input,
        dataKey: "given"
    }, {
        key: "prefix",
        text: leafLevel.inputProperty("prefix")
    }, {
        key: "suffix",
        text: leafLevel.inputProperty("suffix")
    }],
    dataKey: "name",
    dataTransform: translate.name
};

var telecom = exports.telecom = {
    key: "telecom",
    attributes: {
        value: leafLevel.inputProperty("value"),
        use: leafLevel.inputProperty("use")
    },
    dataTransform: translate.telecom
};

var representedOrganization = {
    key: "representedOrganization",
    content: [
        id, {
            key: "name",
            text: leafLevel.input,
            dataKey: "name"
        },
        usRealmAddress,
        telecom
    ],
    dataKey: "organization"
};

var assignedEntity = exports.assignedEntity = {
    key: "assignedEntity",
    content: [{
            key: "code",
            attributes: leafLevel.code,
            dataKey: "code"
        },
        id,
        usRealmAddress,
        telecom, {
            key: "assignedPerson",
            content: usRealmName,
            existsWhen: condition.keyExists("name")
        },
        representedOrganization
    ],
    existsWhen: condition.eitherKeyExists("address", "identifiers", "organization", "name")
};

exports.author = {
    key: "author",
    content: [
        [effectiveTime, required, key("time")], {
            key: "assignedAuthor",
            content: [
                id, {
                    key: "assignedPerson",
                    content: usRealmName
                }
            ]
        }
    ],
    dataKey: "author"
};

exports.performer = {
    key: "performer",
    content: [
        [assignedEntity, required]
    ],
    dataKey: "performer"
};

},{"./condition":3,"./contentModifier":4,"./leafLevel":22,"./translate":24,"blue-button-meta":25}],21:[function(require,module,exports){
"use strict";

var fieldLevel = require('./fieldLevel');
var leafLevel = require('./leafLevel');
var condition = require('./condition');
var contentModifier = require("./contentModifier");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

var patientName = Object.create(fieldLevel.usRealmName);
patientName.attributes = {
    use: "L"
};

var patient = exports.patient = {
    key: "patient",
    content: [
        patientName, {
            key: "administrativeGenderCode",
            attributes: {
                code: function (input) {
                    return input.substring(0, 1);
                },
                codeSystem: "2.16.840.1.113883.5.1",
                codeSystemName: "HL7 AdministrativeGender",
                displayName: leafLevel.input
            },
            dataKey: "gender"
        },
        [fieldLevel.effectiveTime, key("birthTime"), dataKey("dob")], {
            key: "maritalStatusCode",
            attributes: {
                code: function (input) {
                    return input.substring(0, 1);
                },
                displayName: leafLevel.input,
                codeSystem: "2.16.840.1.113883.5.2",
                codeSystemName: "HL7 Marital Status"
            },
            dataKey: "marital_status"
        }, {
            key: "religiousAffiliationCode",
            attributes: leafLevel.codeFromName("2.16.840.1.113883.5.1076"),
            dataKey: "religion"
        }, {
            key: "ethnicGroupCode",
            attributes: leafLevel.codeFromName("2.16.840.1.113883.6.238"),
            dataKey: "race_ethnicity",
            existsWhen: function (input) {
                return input === "Hispanic or Latino";
            }
        }, {
            key: "raceCode",
            attributes: leafLevel.codeFromName("2.16.840.1.113883.6.238"),
            dataKey: "race_ethnicity",
            existsWhen: function (input) {
                return input !== "Hispanic or Latino";
            }
        }, {
            key: "guardian",
            content: [{
                    key: "code",
                    attributes: leafLevel.codeFromName("2.16.840.1.113883.5.111"),
                    dataKey: "relation"
                },
                [fieldLevel.usRealmAddress, dataKey("addresses")],
                fieldLevel.telecom, {
                    key: "guardianPerson",
                    content: {
                        key: "name",
                        content: [{
                            key: "given",
                            text: leafLevel.inputProperty("first")
                        }, {
                            key: "family",
                            text: leafLevel.inputProperty("last")
                        }],
                        dataKey: "names"
                    }
                }
            ],
            dataKey: "guardians"
        }, {
            key: "birthplace",
            content: {
                key: "place",
                content: [
                    [fieldLevel.usRealmAddress, dataKey("birthplace")]
                ]
            },
            existsWhen: condition.keyExists("birthplace")
        }, {
            key: "languageCommunication",
            content: [{
                key: "languageCode",
                attributes: {
                    code: leafLevel.input
                },
                dataKey: "language"
            }, {
                key: "modeCode",
                attributes: leafLevel.codeFromName("2.16.840.1.113883.5.60"),
                dataKey: "mode"
            }, {
                key: "proficiencyLevelCode",
                attributes: {
                    code: function (input) {
                        return input.substring(0, 1);
                    },
                    displayName: leafLevel.input,
                    codeSystem: "2.16.840.1.113883.5.61",
                    codeSystemName: "LanguageAbilityProficiency"
                },
                dataKey: "proficiency"
            }, {
                key: "preferenceInd",
                attributes: {
                    value: function (input) {
                        return input.toString();
                    }
                },
                dataKey: "preferred"
            }],
            dataKey: "languages"
        }
    ]
};

var recordTarget = exports.recordTarget = {
    key: "recordTarget",
    content: {
        key: "patientRole",
        content: [
            fieldLevel.id, [fieldLevel.usRealmAddress, dataKey("addresses")],
            fieldLevel.telecom,
            patient
        ]
    },
    dataKey: "demographics"
};

},{"./condition":3,"./contentModifier":4,"./fieldLevel":20,"./leafLevel":22}],22:[function(require,module,exports){
"use strict";

var translate = require('./translate');

exports.input = function (input) {
    return input;
};

exports.inputProperty = function (key) {
    return function (input) {
        return input && input[key];
    };
};

exports.boolInputProperty = function (key) {
    return function (input) {
        if (input && input.hasOwnProperty(key)) {
            return input[key].toString();
        } else {
            return null;
        }
    };
};

exports.code = translate.code;

exports.codeFromName = translate.codeFromName;

exports.codeOnlyFromName = function (OID, key) {
    var f = translate.codeFromName(OID);
    return function (input) {
        if (input && input[key]) {
            return f(input[key]).code;
        } else {
            return null;
        }
    };
};

exports.time = translate.time;

exports.use = function (key) {
    return function (input) {
        var value = input && input[key];
        if (value) {
            return translate.acronymize(value);
        } else {
            return null;
        }
    };
};

exports.typeCD = {
    "xsi:type": "CD"
};

exports.typeCE = {
    "xsi:type": "CE"
};

exports.nextReference = function (referenceKey) {
    return function (input, context) {
        return context.nextReference(referenceKey);
    };
};

exports.sameReference = function (referenceKey) {
    return function (input, context) {
        return context.sameReference(referenceKey);
    };
};

},{"./translate":24}],23:[function(require,module,exports){
"use strict";

var fieldLevel = require("./fieldLevel");
var entryLevel = require("./entryLevel");
var contentModifier = require("./contentModifier");

var required = contentModifier.required;

exports.allergiesSectionEntriesRequired = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.6"),
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.6.1"),
            fieldLevel.templateCode("AllergiesSection"),
            fieldLevel.templateTitle("AllergiesSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    "typeCode": "DRIV"
                },
                content: [
                    [entryLevel.allergyProblemAct, required]
                ],
                dataKey: "allergies",
                required: true
            }
        ]
    }]
};

exports.medicationsSectionEntriesRequired = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.1"),
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.1.1"),
            fieldLevel.templateCode("MedicationsSection"),
            fieldLevel.templateTitle("MedicationsSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    "typeCode": "DRIV"
                },
                content: [
                    [entryLevel.medicationActivity, required]
                ],
                dataKey: "medications",
                required: true
            }
        ]
    }]
};

exports.problemsSectionEntriesRequired = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.5"),
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.5.1"),
            fieldLevel.templateCode("ProblemSection"),
            fieldLevel.templateTitle("ProblemSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    "typeCode": "DRIV"
                },
                content: [
                    [entryLevel.problemConcernAct, required]
                ],
                dataKey: "problems",
                required: true
            }
        ]
    }]
};

exports.proceduresSectionEntriesRequired = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.7"),
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.7.1"),
            fieldLevel.templateCode("ProceduresSection"),
            fieldLevel.templateTitle("ProceduresSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    "typeCode": function (input) {
                        return input.procedure_type === "procedure" ? "DRIV" : null;
                    }
                },
                content: [
                    entryLevel.procedureActivityAct,
                    entryLevel.procedureActivityProcedure,
                    entryLevel.procedureActivityObservation
                ],
                dataKey: "procedures"
            }
        ]
    }],
    notImplemented: [
        "entry required"
    ]
};

exports.resultsSectionEntriesRequired = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.3"),
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.3.1"),
            fieldLevel.templateCode("ResultsSection"),
            fieldLevel.templateTitle("ResultsSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    typeCode: "DRIV"
                },
                content: [
                    [entryLevel.resultOrganizer, required]
                ],
                dataKey: "results",
                required: true
            }
        ]
    }]
};

exports.encountersSectionEntriesOptional = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.22"),
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.22.1"),
            fieldLevel.templateCode("EncountersSection"),
            fieldLevel.templateTitle("EncountersSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    "typeCode": "DRIV"
                },
                content: [
                    [entryLevel.encounterActivities, required]
                ],
                dataKey: "encounters"
            }
        ]
    }]
};

exports.immunizationsSectionEntriesOptional = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.2"),
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.2.1"),
            fieldLevel.templateCode("ImmunizationsSection"),
            fieldLevel.templateTitle("ImmunizationsSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    "typeCode": "DRIV"
                },
                content: [
                    [entryLevel.immunizationActivity, required]
                ],
                dataKey: "immunizations"
            }
        ]
    }]
};

exports.payersSection = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.18"),
            fieldLevel.templateCode("PayersSection"),
            fieldLevel.templateTitle("PayersSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    typeCode: "DRIV"
                },
                content: [
                    [entryLevel.coverageActivity, required]
                ],
                dataKey: "payers"
            }
        ]
    }]
};

exports.planOfCareSection = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.10"),
            fieldLevel.templateCode("PlanOfCareSection"),
            fieldLevel.templateTitle("PlanOfCareSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    "typeCode": function (input) {
                        return input.type === "observation" ? "DRIV" : null;
                    }
                },
                content: [
                    entryLevel.planOfCareActivityAct,
                    entryLevel.planOfCareActivityObservation,
                    entryLevel.planOfCareActivityProcedure,
                    entryLevel.planOfCareActivityEncounter,
                    entryLevel.planOfCareActivitySubstanceAdministration,
                    entryLevel.planOfCareActivitySupply,
                    entryLevel.planOfCareActivityInstructions
                ],
                dataKey: "plan_of_care"
            }
        ]
    }]
};

exports.socialHistorySection = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.17"),
            fieldLevel.templateCode("SocialHistorySection"),
            fieldLevel.templateTitle("SocialHistorySection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    typeCode: "DRIV"
                },
                content: [
                    entryLevel.smokingStatusObservation,
                    entryLevel.socialHistoryObservation
                ],
                dataKey: "social_history"
            }
        ]
    }],
    notImplemented: [
        "pregnancyObservation",
        "tobaccoUse"
    ]
};

exports.vitalSignsSectionEntriesOptional = {
    key: "component",
    content: [{
        key: "section",
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.4"),
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.2.4.1"),
            fieldLevel.templateCode("VitalSignsSection"),
            fieldLevel.templateTitle("VitalSignsSection"), {
                key: "text",
                text: ""
            }, {
                key: "entry",
                attributes: {
                    typeCode: "DRIV"
                },
                content: [
                    [entryLevel.vitalSignsOrganizer, required]
                ],
                dataKey: "vitals"
            }
        ]
    }]
};

},{"./contentModifier":4,"./entryLevel":10,"./fieldLevel":20}],24:[function(require,module,exports){
"use strict";

var moment = require("moment");
var bbm = require("blue-button-meta");

var css = bbm.code_systems;

exports.codeFromName = function (OID) {
    return function (input) {
        var cs = css.find(OID);
        var code = cs ? cs.displayNameCode(input) : undefined;
        var systemInfo = cs.systemId(OID);
        return {
            "displayName": input,
            "code": code,
            "codeSystem": systemInfo.codeSystem,
            "codeSystemName": systemInfo.codeSystemName
        };
    };
};

exports.code = function (input) {
    var result = {};
    if (input.code) {
        result.code = input.code;
    }

    if (input.name) {
        result.displayName = input.name;
    }

    var code_system = input.code_system || (input.code_system_name && css.findFromName(input.code_system_name));
    if (code_system) {
        result.codeSystem = code_system;
    }

    if (input.code_system_name) {
        result.codeSystemName = input.code_system_name;
    }

    return result;
};

var precisionToFormat = {
    year: 'YYYY',
    month: 'YYYYMM',
    day: 'YYYYMMDD',
    hour: 'YYYYMMDDHH',
    minute: 'YYYYMMDDHHMM',
    second: 'YYYYMMDDHHmmssZZ',
    subsecond: 'YYYYMMDDHHmmss.SSSZZ'
};

exports.time = function (input) {
    var m = moment.parseZone(input.date);
    var formatSpec = precisionToFormat[input.precision];
    var result = m.format(formatSpec);
    return result;
};

var acronymize = exports.acronymize = function (string) {
    var ret = string.split(" ");
    var fL = ret[0].slice(0, 1);
    var lL = ret[1].slice(0, 1);
    fL = fL.toUpperCase();
    lL = lL.toUpperCase();
    ret = fL + lL;
    if (ret === "PH") {
        ret = "HP";
    }
    if (ret === "HA") {
        ret = "H";
    }
    return ret;
};

exports.telecom = function (input) {
    var transformPhones = function (input) {
        var phones = input.phone;
        if (phones) {
            return phones.reduce(function (r, phone) {
                if (phone && phone.number) {
                    var attrs = {
                        value: "tel:" + phone.number
                    };
                    if (phone.type) {
                        attrs.use = acronymize(phone.type);
                    }
                    r.push(attrs);
                }
                return r;
            }, []);
        } else {
            return [];
        }
    };

    var transformEmails = function (input) {
        var emails = input.email;
        if (emails) {
            return emails.reduce(function (r, email) {
                if (email && email.address) {
                    var attrs = {
                        value: "mailto:" + email.address
                    };
                    if (email.type) {
                        attrs.use = acronymize(email.type);
                    }
                    r.push(attrs);
                }
                return r;
            }, []);
        } else {
            return [];
        }
    };

    var result = [].concat(transformPhones(input), transformEmails(input));
    return result.length === 0 ? null : result;
};

var nameSingle = function (input) {
    var given = null;
    if (input.first) {
        given = [input.first];
        if (input.middle && input.middle[0]) {
            given.push(input.middle[0]);
        }
    }
    return {
        prefix: input.prefix,
        given: given,
        family: input.last,
        suffix: input.suffix
    };
};

exports.name = function (input) {
    if (Array.isArray(input)) {
        return input.map(function (e) {
            return nameSingle(e);
        });
    } else {
        return nameSingle(input);
    }
};

},{"blue-button-meta":25,"moment":73}],25:[function(require,module,exports){
var CCDA = require("./lib/CCDA/index.js");

//CCDA metadata stuff
var meta = {};
meta.CCDA = CCDA;

meta.supported_sections = [
    'allergies',
    'procedures',
    'immunizations',
    'medications',
    'encounters',
    'vitals',
    'results',
    'social_history',
    'demographics',
    'problems',
    'insurance',
    'claims',
    'plan_of_care',
    'payers',
    'providers'
];

meta.code_systems = require("./lib/code-systems");

module.exports = exports = meta;

},{"./lib/CCDA/index.js":28,"./lib/code-systems":33}],26:[function(require,module,exports){
var clinicalstatements = {
    "AdmissionMedication": "2.16.840.1.113883.10.20.22.4.36",
    "AdvanceDirectiveObservation": "2.16.840.1.113883.10.20.22.4.48",
    "AgeObservation": "2.16.840.1.113883.10.20.22.4.31",
    "AllergyObservation": "2.16.840.1.113883.10.20.22.4.7",
    "AllergyProblemAct": "2.16.840.1.113883.10.20.22.4.30",
    "AllergyStatusObservation": "2.16.840.1.113883.10.20.22.4.28",
    "AssessmentScaleObservation": "2.16.840.1.113883.10.20.22.4.69",
    "AssessmentScaleSupportingObservation": "2.16.840.1.113883.10.20.22.4.86",
    "AuthorizationActivity": "2.16.840.1.113883.10.20.1.19",
    "BoundaryObservation": "2.16.840.1.113883.10.20.6.2.11",
    "CaregiverCharacteristics": "2.16.840.1.113883.10.20.22.4.72",
    "CodeObservations": "2.16.840.1.113883.10.20.6.2.13",
    "CognitiveStatusProblemObservation": "2.16.840.1.113883.10.20.22.4.73",
    "CognitiveStatusResultObservation": "2.16.840.1.113883.10.20.22.4.74",
    "CognitiveStatusResultOrganizer": "2.16.840.1.113883.10.20.22.4.75",
    "CommentActivity": "2.16.840.1.113883.10.20.22.4.64",
    "CoverageActivity": "2.16.840.1.113883.10.20.22.4.60",
    "DeceasedObservation": "2.16.840.1.113883.10.20.22.4.79",
    "DischargeMedication": "2.16.840.1.113883.10.20.22.4.35",
    "EncounterActivities": "2.16.840.1.113883.10.20.22.4.49",
    "EncounterDiagnosis": "2.16.840.1.113883.10.20.22.4.80",
    "EstimatedDateOfDelivery": "2.16.840.1.113883.10.20.15.3.1",
    "FamilyHistoryDeathObservation": "2.16.840.1.113883.10.20.22.4.47",
    "FamilyHistoryObservation": "2.16.840.1.113883.10.20.22.4.46",
    "FamilyHistoryOrganizer": "2.16.840.1.113883.10.20.22.4.45",
    "FunctionalStatusProblemObservation": "2.16.840.1.113883.10.20.22.4.68",
    "FunctionalStatusResultObservation": "2.16.840.1.113883.10.20.22.4.67",
    "FunctionalStatusResultOrganizer": "2.16.840.1.113883.10.20.22.4.66",
    "HealthStatusObservation": "2.16.840.1.113883.10.20.22.4.5",
    "HighestPressureUlcerStage": "2.16.840.1.113883.10.20.22.4.77",
    "HospitalAdmissionDiagnosis": "2.16.840.1.113883.10.20.22.4.34",
    "HospitalDischargeDiagnosis": "2.16.840.1.113883.10.20.22.4.33",
    "ImmunizationActivity": "2.16.840.1.113883.10.20.22.4.52",
    "ImmunizationRefusalReason": "2.16.840.1.113883.10.20.22.4.53",
    "Indication": "2.16.840.1.113883.10.20.22.4.19",
    "Instructions": "2.16.840.1.113883.10.20.22.4.20",
    "MedicationActivity": "2.16.840.1.113883.10.20.22.4.16",
    "MedicationDispense": "2.16.840.1.113883.10.20.22.4.18",
    "MedicationSupplyOrder": "2.16.840.1.113883.10.20.22.4.17",
    "MedicationUseNoneKnown": "2.16.840.1.113883.10.20.22.4.29",
    "NonMedicinalSupplyActivity": "2.16.840.1.113883.10.20.22.4.50",
    "NumberOfPressureUlcersObservation": "2.16.840.1.113883.10.20.22.4.76",
    "PlanOfCareActivityAct": "2.16.840.1.113883.10.20.22.4.39",
    "PlanOfCareActivityEncounter": "2.16.840.1.113883.10.20.22.4.40",
    "PlanOfCareActivityObservation": "2.16.840.1.113883.10.20.22.4.44",
    "PlanOfCareActivityProcedure": "2.16.840.1.113883.10.20.22.4.41",
    "PlanOfCareActivitySubstanceAdministration": "2.16.840.1.113883.10.20.22.4.42",
    "PlanOfCareActivitySupply": "2.16.840.1.113883.10.20.22.4.43",
    "PolicyActivity": "2.16.840.1.113883.10.20.22.4.61",
    "PostprocedureDiagnosis": "2.16.840.1.113883.10.20.22.4.51",
    "PregnancyObservation": "2.16.840.1.113883.10.20.15.3.8",
    "PreoperativeDiagnosis": "2.16.840.1.113883.10.20.22.4.65",
    "PressureUlcerObservation": "2.16.840.1.113883.10.20.22.4.70",
    "ProblemConcernAct": "2.16.840.1.113883.10.20.22.4.3",
    "ProblemObservation": "2.16.840.1.113883.10.20.22.4.4",
    "ProblemStatus": "2.16.840.1.113883.10.20.22.4.6",
    "ProcedureActivityAct": "2.16.840.1.113883.10.20.22.4.12",
    "ProcedureActivityObservation": "2.16.840.1.113883.10.20.22.4.13",
    "ProcedureActivityProcedure": "2.16.840.1.113883.10.20.22.4.14",
    "ProcedureContext": "2.16.840.1.113883.10.20.6.2.5",
    "PurposeofReferenceObservation": "2.16.840.1.113883.10.20.6.2.9",
    "QuantityMeasurementObservation": "2.16.840.1.113883.10.20.6.2.14",
    "ReactionObservation": "2.16.840.1.113883.10.20.22.4.9",
    "ReferencedFramesObservation": "2.16.840.1.113883.10.20.6.2.10",
    "ResultObservation": "2.16.840.1.113883.10.20.22.4.2",
    "ResultOrganizer": "2.16.840.1.113883.10.20.22.4.1",
    "SeriesAct": "2.16.840.1.113883.10.20.22.4.63",
    "SeverityObservation": "2.16.840.1.113883.10.20.22.4.8",
    "SmokingStatusObservation": "2.16.840.1.113883.10.20.22.4.78",
    "SocialHistoryObservation": "2.16.840.1.113883.10.20.22.4.38",
    "SOPInstanceObservation": "2.16.840.1.113883.10.20.6.2.8",
    "StudyAct": "2.16.840.1.113883.10.20.6.2.6",
    "TextObservation": "2.16.840.1.113883.10.20.6.2.12",
    "TobaccoUse": "2.16.840.1.113883.10.20.22.4.85",
    "VitalSignObservation": "2.16.840.1.113883.10.20.22.4.27",
    "VitalSignsOrganizer": "2.16.840.1.113883.10.20.22.4.26"
};

var clinicalstatements_r1 = {
    "AdvanceDirectiveObservation": "2.16.840.1.113883.10.20.1.17",
    "AlertObservation": "2.16.840.1.113883.10.20.1.18",
    "AuthorizationActivity": "2.16.840.1.113883.10.20.1.19",
    "CoverageActivity": "2.16.840.1.113883.10.20.1.20",
    "EncounterActivity": "2.16.840.1.113883.10.20.1.21",
    "FamilyHistoryObservation": "2.16.840.1.113883.10.20.1.22",
    "FamilyHistoryOrganizer": "2.16.840.1.113883.10.20.1.23",
    "MedicationActivity": "2.16.840.1.113883.10.20.1.24",
    "PlanOfCareActivity": "2.16.840.1.113883.10.20.1.25",
    "PolicyActivity": "2.16.840.1.113883.10.20.1.26",
    "ProblemAct": "2.16.840.1.113883.10.20.1.27",
    "ProblemObservation": "2.16.840.1.113883.10.20.1.28",
    "ProcedureActivity": "2.16.840.1.113883.10.20.1.29",
    "PurposeActivity": "2.16.840.1.113883.10.20.1.30",
    "ResultObservation": "2.16.840.1.113883.10.20.1.31",
    "ResultOrganizer": "2.16.840.1.113883.10.20.1.32",
    "SocialHistoryObservation": "2.16.840.1.113883.10.20.1.33",
    "SupplyActivity": "2.16.840.1.113883.10.20.1.34",
    "VitalSignObservation": "2.16.840.1.113883.10.20.1.31",
    "Indication": "2.16.840.1.113883.10.20.22.4.19",
    "VitalSignsOrganizer": "2.16.840.1.113883.10.20.1.35",
    "AdvanceDirectiveReference": "2.16.840.1.113883.10.20.1.36",
    "AdvanceDirectiveStatusObservation": "2.16.840.1.113883.10.20.1.37",
    "AgeObservation": "2.16.840.1.113883.10.20.1.38",
    "AlertStatusObservation": "2.16.840.1.113883.10.20.1.39",
    "Comment": "2.16.840.1.113883.10.20.1.40",
    "EpisodeObservation": "2.16.840.1.113883.10.20.1.41",
    "FamilyHistoryCauseOfDeathObservation": "2.16.840.1.113883.10.20.1.42",
    "FulfillmentInstruction": "2.16.840.1.113883.10.20.1.43",
    "LocationParticipation": "2.16.840.1.113883.10.20.1.45",
    "MedicationSeriesNumberObservation": "2.16.840.1.113883.10.20.1.46",
    "MedicationStatusObservation": "2.16.840.1.113883.10.20.1.47",
    "PatientAwareness": "2.16.840.1.113883.10.20.1.48",
    "PatientInstruction": "2.16.840.1.113883.10.20.1.49",
    "ProblemHealthstatusObservation": "2.16.840.1.113883.10.20.1.51",
    "ProblemStatusObservation": "2.16.840.1.113883.10.20.1.50",
    "Product": "2.16.840.1.113883.10.20.1.53",
    "ProductInstance": "2.16.840.1.113883.10.20.1.52",
    "ReactionObservation": "2.16.840.1.113883.10.20.1.54",
    "SeverityObservation": "2.16.840.1.113883.10.20.1.55",
    "SocialHistoryStatusObservation": "2.16.840.1.113883.10.20.1.56",
    "StatusObservation": "2.16.840.1.113883.10.20.1.57",
    "StatusOfFunctionalStatusObservation": "2.16.840.1.113883.10.20.1.44",
    "VerificationOfAnAdvanceDirectiveObservation": "2.16.840.1.113883.10.20.1.58"
};

module.exports.clinicalstatements = clinicalstatements;
module.exports.clinicalstatements_r1 = clinicalstatements_r1;

},{}],27:[function(require,module,exports){
var codeSystems = {
    "LOINC": ["2.16.840.1.113883.6.1", "8716-3"],
    "SNOMED CT": ["2.16.840.1.113883.6.96", "46680005"],
    "RXNORM": ["2.16.840.1.113883.6.88"],
    "ActCode": ["2.16.840.1.113883.5.4"],
    "CPT-4": ["2.16.840.1.113883.6.12"],
    "CVX": ["2.16.840.1.113883.12.292"],
    "HL7 Role": ["2.16.840.1.113883.5.111"],
    "HL7 RoleCode": ["2.16.840.1.113883.5.110"],
    "UNII": ["2.16.840.1.113883.4.9"],
    "Observation Interpretation": ["2.16.840.1.113883.1.11.78"],
    "CPT": ["2.16.840.1.113883.6.12"],
    "HealthcareServiceLocation": ["2.16.840.1.113883.6.259"],
    "HL7 Result Interpretation": ["2.16.840.1.113883.5.83"],
    "Act Reason": ["2.16.840.1.113883.5.8"],
    "Medication Route FDA": ["2.16.840.1.113883.3.26.1.1"],
    "Body Site Value Set": ["2.16.840.1.113883.3.88.12.3221.8.9"],
    "MediSpan DDID": ["2.16.840.1.113883.6.253"],
    "ActPriority": ["2.16.840.1.113883.5.7"],
    "InsuranceType Code": ["2.16.840.1.113883.6.255.1336"],
    "ICD-9-CM": ["2.16.840.1.113883.6.103"]
};

var sections_entries_codes = {
    "codes": {
        "AdvanceDirectivesSectionEntriesOptional": {
            "code": "42348-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Advance Directives"
        },
        "AdvanceDirectivesSection": {
            "code": "42348-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Advance Directives"
        },
        "AllergiesSectionEntriesOptional": {
            "code": "48765-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Allergies, adverse reactions, alerts"
        },
        "AllergiesSection": {
            "code": "48765-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Allergies, adverse reactions, alerts"
        },
        "AnesthesiaSection": {
            "code": "59774-0",
            "code_system": "",
            "code_system_name": "",
            "name": "Anesthesia"
        },
        "AssessmentAndPlanSection": {
            "code": "51847-2",
            "code_system": "",
            "code_system_name": "",
            "name": "Assessment and Plan"
        },
        "AssessmentSection": {
            "code": "51848-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Assessments"
        },
        "ChiefComplaintAndReasonForVisitSection": {
            "code": "46239-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Chief Complaint and Reason for Visit"
        },
        "ChiefComplaintSection": {
            "code": "10154-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Chief Complaint"
        },
        "undefined": "",
        "ComplicationsSection": {
            "code": "55109-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Complications"
        },
        "DICOMObjectCatalogSection": {
            "code": "121181",
            "code_system": "1.2.840.10008.2.16.4",
            "code_system_name": "DCM",
            "name": "Dicom Object Catalog"
        },
        "DischargeDietSection": {
            "code": "42344-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Discharge Diet"
        },
        "EncountersSectionEntriesOptional": {
            "code": "46240-8",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Encounters"
        },
        "EncountersSection": {
            "code": "46240-8",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Encounters"
        },
        "FamilyHistorySection": {
            "code": "10157-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Family History"
        },
        "FindingsSection": "",
        "FunctionalStatusSection": {
            "code": "47420-5",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Functional Status"
        },
        "GeneralStatusSection": {
            "code": "10210-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "General Status"
        },
        "HistoryOfPastIllnessSection": {
            "code": "11348-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "History of Past Illness"
        },
        "HistoryOfPresentIllnessSection": {
            "code": "10164-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "History Of Present Illness Section"
        },
        "HospitalAdmissionDiagnosisSection": {
            "code": "46241-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Hospital Admission Diagnosis"
        },
        "HospitalAdmissionMedicationsSectionEntriesOptional": {
            "code": "42346-7",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Medications on Admission"
        },
        "HospitalConsultationsSection": {
            "code": "18841-7",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Hospital Consultations Section"
        },
        "HospitalCourseSection": {
            "code": "8648-8",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Hospital Course"
        },
        "HospitalDischargeDiagnosisSection": {
            "code": "11535-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Hospital Discharge Diagnosis"
        },
        "HospitalDischargeInstructionsSection": {
            "code": "8653-8",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Hospital Discharge Instructions"
        },
        "HospitalDischargeMedicationsSectionEntriesOptional": {
            "code": "10183-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Hospital Discharge Medications"
        },
        "HospitalDischargePhysicalSection": {
            "code": "10184-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Hospital Discharge Physical"
        },
        "HospitalDischargeStudiesSummarySection": {
            "code": "11493-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Hospital Discharge Studies Summary"
        },
        "ImmunizationsSectionEntriesOptional": {
            "code": "11369-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Immunizations"
        },
        "ImmunizationsSection": {
            "code": "11369-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Immunizations"
        },
        "InstructionsSection": {
            "code": "69730-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Instructions"
        },
        "InterventionsSection": {
            "code": "62387-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Interventions Provided"
        },
        "MedicalHistorySection": {
            "code": "11329-0",
            "code_system": "",
            "code_system_name": "",
            "name": "Medical"
        },
        "MedicalEquipmentSection": {
            "code": "46264-8",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Medical Equipment"
        },
        "MedicationsAdministeredSection": {
            "code": "29549-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Medications Administered"
        },
        "MedicationsSectionEntriesOptional": {
            "code": "10160-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "History of medication use"
        },
        "MedicationsSection": {
            "code": "10160-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "History of medication use"
        },
        "ObjectiveSection": {
            "code": "61149-1",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Objective"
        },
        "OperativeNoteFluidSection": {
            "code": "10216-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Operative Note Fluids"
        },
        "OperativeNoteSurgicalProcedureSection": {
            "code": "10223-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Operative Note Surgical Procedure"
        },
        "PayersSection": {
            "code": "48768-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Payers"
        },
        "PhysicalExamSection": {
            "code": "29545-1",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Physical Findings"
        },
        "PlanOfCareSection": {
            "code": "18776-5",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Plan of Care"
        },
        "PlannedProcedureSection": {
            "code": "59772-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Planned Procedure"
        },
        "PostoperativeDiagnosisSection": {
            "code": "10218-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Postoperative Diagnosis"
        },
        "PostprocedureDiagnosisSection": {
            "code": "59769-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Postprocedure Diagnosis"
        },
        "PreoperativeDiagnosisSection": {
            "code": "10219-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Preoperative Diagnosis"
        },
        "ProblemSectionEntriesOptional": {
            "code": "11450-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Problem List"
        },
        "ProblemSection": {
            "code": "11450-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Problem List"
        },
        "ProcedureDescriptionSection": {
            "code": "29554-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Procedure Description"
        },
        "ProcedureDispositionSection": {
            "code": "59775-7",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Procedure Disposition"
        },
        "ProcedureEstimatedBloodLossSection": {
            "code": "59770-8",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Procedure Estimated Blood Loss"
        },
        "ProcedureFindingsSection": {
            "code": "59776-5",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Procedure Findings"
        },
        "ProcedureImplantsSection": {
            "code": "59771-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Procedure Implants"
        },
        "ProcedureIndicationsSection": {
            "code": "59768-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Procedure Indications"
        },
        "ProcedureSpecimensTakenSection": {
            "code": "59773-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Procedure Specimens Taken"
        },
        "ProceduresSectionEntriesOptional": {
            "code": "47519-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "History of Procedures"
        },
        "ProceduresSection": {
            "code": "47519-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "History of Procedures"
        },
        "ReasonForReferralSection": {
            "code": "42349-1",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Reason for Referral"
        },
        "ReasonForVisitSection": {
            "code": "29299-5",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Reason for Visit"
        },
        "ResultsSectionEntriesOptional": {
            "code": "30954-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Relevant diagnostic tests and/or laboratory data"
        },
        "ResultsSection": {
            "code": "30954-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Relevant diagnostic tests and/or laboratory data"
        },
        "ReviewOfSystemsSection": {
            "code": "10187-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Review of Systems"
        },
        "SocialHistorySection": {
            "code": "29762-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Social History"
        },
        "SubjectiveSection": {
            "code": "61150-9",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Subjective"
        },
        "SurgicalDrainsSection": {
            "code": "11537-8",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Surgical Drains"
        },
        "VitalSignsSectionEntriesOptional": {
            "code": "8716-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Vital Signs"
        },
        "VitalSignsSection": {
            "code": "8716-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Vital Signs"
        },
        "AdmissionMedication": {
            "code": "42346-7",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Medications on Admission"
        },
        "AdvanceDirectiveObservation": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "AgeObservation": {
            "code": "445518008",
            "code_system": "2.16.840.1.113883.6.96",
            "code_system_name": "SNOMED-CT",
            "name": "Age At Onset"
        },
        "AllergyObservation": {
            "code": "ASSERTION",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Assertion"
        },
        "AllergyProblemAct": {
            "code": "48765-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Allergies, adverse reactions, alerts"
        },
        "AllergyStatusObservation": {
            "code": "33999-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Status"
        },
        "AssessmentScaleObservation": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "AssessmentScaleSupportingObservation": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "AuthorizationActivity": "",
        "BoundaryObservation": {
            "code": "113036",
            "code_system": "1.2.840.10008.2.16.4",
            "code_system_name": "DCM",
            "name": "Frames for Display"
        },
        "CaregiverCharacteristics": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "CodeObservations": "",
        "CognitiveStatusProblemObservation": {
            "code": "373930000",
            "code_system": "2.16.840.1.113883.6.96",
            "code_system_name": "SNOMED-CT",
            "name": "Cognitive function finding"
        },
        "CognitiveStatusResultObservation": {
            "code": "373930000",
            "code_system": "2.16.840.1.113883.6.96",
            "code_system_name": "SNOMED-CT",
            "name": "Cognitive function finding"
        },
        "CognitiveStatusResultOrganizer": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "CommentActivity": {
            "code": "48767-8",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Annotation Comment"
        },
        "CoverageActivity": {
            "code": "48768-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Payment sources"
        },
        "DeceasedObservation": {
            "code": "ASSERTION",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Assertion"
        },
        "DischargeMedication": {
            "code": "10183-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Discharge medication"
        },
        "EncounterActivities": "",
        "EncounterDiagnosis": {
            "code": "29308-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Diagnosis"
        },
        "EstimatedDateOfDelivery": {
            "code": "11778-8",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Estimated date of delivery"
        },
        "FamilyHistoryDeathObservation": {
            "code": "ASSERTION",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Assertion"
        },
        "FamilyHistoryObservation": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "FamilyHistoryOrganizer": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "FunctionalStatusProblemObservation": {
            "code": "248536006",
            "code_system": "2.16.840.1.113883.6.96",
            "code_system_name": "SNOMED-CT",
            "name": "finding of functional performance and activity"
        },
        "FunctionalStatusResultObservation": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "FunctionalStatusResultOrganizer": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "HealthStatusObservation": {
            "code": "11323-3",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Health status"
        },
        "HighestPressureUlcerStage": {
            "code": "420905001",
            "code_system": "2.16.840.1.113883.6.96",
            "code_system_name": "SNOMED-CT",
            "name": "Highest Pressure Ulcer Stage"
        },
        "HospitalAdmissionDiagnosis": {
            "code": "46241-6",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Admission diagnosis"
        },
        "HospitalDischargeDiagnosis": {
            "code": "11535-2",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Hospital discharge diagnosis"
        },
        "ImmunizationActivity": "",
        "ImmunizationRefusalReason": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "Indication": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "Instructions": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "MedicationActivity": "",
        "MedicationDispense": "",
        "MedicationSupplyOrder": "",
        "MedicationUseNoneKnown": {
            "code": "ASSERTION",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Assertion"
        },
        "NonMedicinalSupplyActivity": "",
        "NumberOfPressureUlcersObservation": {
            "code": "2264892003",
            "code_system": "",
            "code_system_name": "",
            "name": "number of pressure ulcers"
        },
        "PlanOfCareActivityAct": "",
        "PlanOfCareActivityEncounter": "",
        "PlanOfCareActivityObservation": "",
        "PlanOfCareActivityProcedure": "",
        "PlanOfCareActivitySubstanceAdministration": "",
        "PlanOfCareActivitySupply": "",
        "PolicyActivity": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "PostprocedureDiagnosis": {
            "code": "59769-0",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Postprocedure diagnosis"
        },
        "PregnancyObservation": {
            "code": "ASSERTION",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Assertion"
        },
        "PreoperativeDiagnosis": {
            "code": "10219-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Preoperative Diagnosis"
        },
        "PressureUlcerObservation": {
            "code": "ASSERTION",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Assertion"
        },
        "ProblemConcernAct": {
            "code": "CONC",
            "code_system": "2.16.840.1.113883.5.6",
            "code_system_name": "HL7ActClass",
            "name": "Concern"
        },
        "ProblemObservation": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "ProblemStatus": {
            "code": "33999-4",
            "code_system": "2.16.840.1.113883.6.1",
            "code_system_name": "LOINC",
            "name": "Status"
        },
        "ProcedureActivityAct": "",
        "ProcedureActivityObservation": "",
        "ProcedureActivityProcedure": "",
        "ProcedureContext": "",
        "PurposeofReferenceObservation": {
            "code": "ASSERTION",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Assertion"
        },
        "QuantityMeasurementObservation": "",
        "ReactionObservation": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "ReferencedFramesObservation": {
            "code": "121190",
            "code_system": "1.2.840.10008.2.16.4",
            "code_system_name": "DCM",
            "name": "Referenced Frames"
        },
        "ResultObservation": "",
        "ResultOrganizer": "",
        "SeriesAct": {
            "code": "113015",
            "code_system": "1.2.840.10008.2.16.4",
            "code_system_name": "DCM",
            "name": "Series Act"
        },
        "SeverityObservation": {
            "code": "SEV",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Severity Observation"
        },
        "SmokingStatusObservation": {
            "code": "ASSERTION",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Assertion"
        },
        "SocialHistoryObservation": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "SOPInstanceObservation": "",
        "StudyAct": {
            "code": "113014",
            "code_system": "1.2.840.10008.2.16.4",
            "code_system_name": "DCM",
            "name": "Study Act"
        },
        "TextObservation": "",
        "TobaccoUse": {
            "code": "ASSERTION",
            "code_system": "2.16.840.1.113883.5.4",
            "code_system_name": "ActCode",
            "name": "Assertion"
        },
        "VitalSignObservation": {
            "code": "completed",
            "code_system": "2.16.840.1.113883.5.14",
            "code_system_name": "ActStatus",
            "name": "Completed"
        },
        "VitalSignsOrganizer": {
            "code": "46680005",
            "code_system": "2.16.840.1.113883.6.96",
            "code_system_name": "SNOMED-CT",
            "name": "Vital signs"
        }
    }
};
module.exports.codeSystems = codeSystems;
module.exports.sections_entries_codes = sections_entries_codes;

},{}],28:[function(require,module,exports){
var templates = require("./templates.js");
var sections = require("./sections.js");
var statements = require("./clinicalstatements.js");

var templatesconstraints = require("./templates-constraints.js");
var sectionsconstraints = require("./sections-constraints.js");
var codeSystems = require("./code-systems.js");

//General Header Constraints
var CCDA = {
    "document": {
        "name": "CCDA",
        "templateId": "2.16.840.1.113883.10.20.22.1.1"
    },
    "templates": templates,
    "sections": sections.sections,
    "sections_r1": sections.sections_r1,
    "statements": statements.clinicalstatements,
    "statements_r1": statements.clinicalstatements_r1,
    "constraints": {
        "sections": sectionsconstraints,
        "templates": templatesconstraints
    },
    "codeSystems": codeSystems.codeSystems,
    "sections_entries_codes": codeSystems.sections_entries_codes

    /*
		,
    //DOCUMENT-LEVEL TEMPLATES
    "templates":[
		{
			"name":"Consultation Note",
			"templateId":"2.16.840.1.113883.10.20.22.1.4"
		},
		{
			"name":"Continuity Of Care Document",
			"templateId":"2.16.840.1.113883.10.20.22.1.2"
		},
		{
			"name":"Diagnostic Imaging Report",
			"templateId":"2.16.840.1.113883.10.20.22.1.5"
		},
		{
			"name":"Discharge Summary",
			"templateId":"2.16.840.1.113883.10.20.22.1.8"
		},
		{
			"name":"History And Physical Note",
			"templateId":"2.16.840.1.113883.10.20.22.1.3"
		},
		{
			"name":"Operative Note",
			"templateId":"2.16.840.1.113883.10.20.22.1.7"
		},
		{
			"name":"Procedure Note",
			"templateId":"2.16.840.1.113883.10.20.22.1.6"
		},
		{
			"name":"Progress Note",
			"templateId":"2.16.840.1.113883.10.20.22.1.9"
		},
		{
			"name":"Unstructured Document",
			"templateId":"2.16.840.1.113883.10.20.21.1.10"
		},
    ],
    //Sections
    "sections":[
		{"name": "Allergies",
			"templateIds": ['2.16.840.1.113883.10.20.22.2.6', '2.16.840.1.113883.10.20.22.2.6.1']
		},
		{"name": "Encounters",
			"templateIds": ['2.16.840.1.113883.10.20.22.2.22', '2.16.840.1.113883.10.20.22.2.22.1']
		},
		{"name": "Immunizations",
			"templateIds": ["2.16.840.1.113883.10.20.22.2.2", "2.16.840.1.113883.10.20.22.2.2.1"]
		},
		{"name": "Medications",
			"templateIds": ["2.16.840.1.113883.10.20.22.2.1", "2.16.840.1.113883.10.20.22.2.1.1"]
		},
		{"name": "Problems",
			"templateIds": ["2.16.840.1.113883.10.20.22.2.5.1"]
		},
		{"name": "Procedures",
			"templateIds": ['2.16.840.1.113883.10.20.22.2.7', '2.16.840.1.113883.10.20.22.2.7.1']
		},
		{"name": "Results",
			"templateIds": ['2.16.840.1.113883.10.20.22.2.3', '2.16.840.1.113883.10.20.22.2.3.1']
		},
		{"name": "Vital Signs",
			"templateIds": ["2.16.840.1.113883.10.20.22.2.4","2.16.840.1.113883.10.20.22.2.4.1"]
		},
		{"name": "Social History",
			"templateIds": ["2.16.840.1.113883.10.20.22.2.17"]
		}		
    ]
    */
};

//Good source http://cdatools.org/SectionMatrix.html
//and http://cdatools.org/ClinicalStatementMatrix.html

module.exports = exports = CCDA;

},{"./clinicalstatements.js":26,"./code-systems.js":27,"./sections-constraints.js":29,"./sections.js":30,"./templates-constraints.js":31,"./templates.js":32}],29:[function(require,module,exports){
var sectionsconstraints = {
    "VitalSignsSection": {
        "full": {
            "VitalSignsOrganizer": {
                "id": [
                    "7276",
                    "7277"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "VitalSignsOrganizer": [
                "7276",
                "7277"
            ]
        }
    },
    "DICOMObjectCatalogSection": {
        "full": {
            "StudyAct": {
                "id": [
                    "8530",
                    "15458"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "StudyAct": [
                "8530",
                "15458"
            ]
        }
    },
    "PayersSection": {
        "full": {
            "CoverageActivity": {
                "id": [
                    "7959",
                    "8905"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "CoverageActivity": [
                "7959",
                "8905"
            ]
        }
    },
    "HospitalDischargeDiagnosisSection": {
        "full": {
            "HospitalDischargeDiagnosis": {
                "id": [
                    "7984"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "HospitalDischargeDiagnosis": [
                "7984"
            ]
        }
    },
    "SocialHistorySection": {
        "may": {
            "TobaccoUse": [
                "16816",
                "16817"
            ],
            "PregnancyObservation": [
                "9133",
                "9132"
            ],
            "SocialHistoryObservation": [
                "7954",
                "7953"
            ]
        },
        "full": {
            "SmokingStatusObservation": {
                "id": [
                    "14824",
                    "14823"
                ],
                "constraint": "should"
            },
            "TobaccoUse": {
                "id": [
                    "16816",
                    "16817"
                ],
                "constraint": "may"
            },
            "PregnancyObservation": {
                "id": [
                    "9133",
                    "9132"
                ],
                "constraint": "may"
            },
            "SocialHistoryObservation": {
                "id": [
                    "7954",
                    "7953"
                ],
                "constraint": "may"
            }
        },
        "should": {
            "SmokingStatusObservation": [
                "14824",
                "14823"
            ]
        }
    },
    "AssessmentAndPlanSection": {
        "may": {
            "PlanOfCareActivityAct": [
                "8798"
            ]
        },
        "full": {
            "PlanOfCareActivityAct": {
                "id": [
                    "8798"
                ],
                "constraint": "may"
            }
        }
    },
    "ResultsSection": {
        "full": {
            "ResultOrganizer": {
                "id": [
                    "7113",
                    "7112"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "ResultOrganizer": [
                "7113",
                "7112"
            ]
        }
    },
    "HospitalAdmissionMedicationsSectionEntriesOptional": {
        "full": {
            "AdmissionMedication": {
                "id": [
                    "10110",
                    "10102"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "AdmissionMedication": [
                "10110",
                "10102"
            ]
        }
    },
    "AllergiesSection": {
        "full": {
            "AllergyProblemAct": {
                "id": [
                    "7531",
                    "7532"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "AllergyProblemAct": [
                "7531",
                "7532"
            ]
        }
    },
    "ComplicationsSection": {
        "may": {
            "ProblemObservation": [
                "8796",
                "8795"
            ]
        },
        "full": {
            "ProblemObservation": {
                "id": [
                    "8796",
                    "8795"
                ],
                "constraint": "may"
            }
        }
    },
    "AdvanceDirectivesSection": {
        "full": {
            "AdvanceDirectiveObservation": {
                "id": [
                    "8801",
                    "8647"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "AdvanceDirectiveObservation": [
                "8801",
                "8647"
            ]
        }
    },
    "MedicationsSectionEntriesOptional": {
        "full": {
            "MedicationActivity": {
                "id": [
                    "7795",
                    "7573"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "MedicationActivity": [
                "7795",
                "7573"
            ]
        }
    },
    "MedicationsAdministeredSection": {
        "may": {
            "MedicationActivity": [
                "8156"
            ]
        },
        "full": {
            "MedicationActivity": {
                "id": [
                    "8156"
                ],
                "constraint": "may"
            }
        }
    },
    "MedicalEquipmentSection": {
        "full": {
            "NonMedicinalSupplyActivity": {
                "id": [
                    "7948.",
                    "8755"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "NonMedicinalSupplyActivity": [
                "7948.",
                "8755"
            ]
        }
    },
    "MedicationsSection": {
        "full": {
            "MedicationActivity": {
                "id": [
                    "7573",
                    "7572"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "MedicationActivity": [
                "7573",
                "7572"
            ]
        }
    },
    "ImmunizationsSection": {
        "full": {
            "ImmunizationActivity": {
                "id": [
                    "9019",
                    "9020"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "ImmunizationActivity": [
                "9019",
                "9020"
            ]
        }
    },
    "AdvanceDirectivesSectionEntriesOptional": {
        "may": {
            "AdvanceDirectiveObservation": [
                "8800",
                "7957"
            ]
        },
        "full": {
            "AdvanceDirectiveObservation": {
                "id": [
                    "8800",
                    "7957"
                ],
                "constraint": "may"
            }
        }
    },
    "ResultsSectionEntriesOptional": {
        "full": {
            "ResultOrganizer": {
                "id": [
                    "7119",
                    "7120"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "ResultOrganizer": [
                "7119",
                "7120"
            ]
        }
    },
    "AnesthesiaSection": {
        "may": {
            "ProcedureActivityProcedure": [
                "8092"
            ],
            "MedicationActivity": [
                "8094"
            ]
        },
        "full": {
            "ProcedureActivityProcedure": {
                "id": [
                    "8092"
                ],
                "constraint": "may"
            },
            "MedicationActivity": {
                "id": [
                    "8094"
                ],
                "constraint": "may"
            }
        }
    },
    "VitalSignsSectionEntriesOptional": {
        "full": {
            "VitalSignsOrganizer": {
                "id": [
                    "7271",
                    "7272"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "VitalSignsOrganizer": [
                "7271",
                "7272"
            ]
        }
    },
    "ImmunizationsSectionEntriesOptional": {
        "full": {
            "ImmunizationActivity": {
                "id": [
                    "7969",
                    "7970"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "ImmunizationActivity": [
                "7969",
                "7970"
            ]
        }
    },
    "FunctionalStatusSection": {
        "may": {
            "PressureUlcerObservation": [
                "16778",
                "16777"
            ],
            "FunctionalStatusProblemObservation": [
                "14422",
                "14423"
            ],
            "CognitiveStatusResultObservation": [
                "14421",
                "14420"
            ],
            "NumberOfPressureUlcersObservation": [
                "16779",
                "16780"
            ],
            "HighestPressureUlcerStage": [
                "16781",
                "16782"
            ],
            "AssessmentScaleObservation": [
                "14581",
                "14580"
            ],
            "FunctionalStatusResultObservation": [
                "14418",
                "14419"
            ],
            "CognitiveStatusProblemObservation": [
                "14425",
                "14424"
            ],
            "FunctionalStatusResultOrganizer": [
                "14414",
                "14415"
            ],
            "CaregiverCharacteristics": [
                "14426",
                "14427"
            ],
            "CognitiveStatusResultOrganizer": [
                "14416",
                "14417"
            ],
            "NonMedicinalSupplyActivity": [
                "14583",
                "14582"
            ]
        },
        "full": {
            "PressureUlcerObservation": {
                "id": [
                    "16778",
                    "16777"
                ],
                "constraint": "may"
            },
            "FunctionalStatusProblemObservation": {
                "id": [
                    "14422",
                    "14423"
                ],
                "constraint": "may"
            },
            "CognitiveStatusResultObservation": {
                "id": [
                    "14421",
                    "14420"
                ],
                "constraint": "may"
            },
            "NumberOfPressureUlcersObservation": {
                "id": [
                    "16779",
                    "16780"
                ],
                "constraint": "may"
            },
            "HighestPressureUlcerStage": {
                "id": [
                    "16781",
                    "16782"
                ],
                "constraint": "may"
            },
            "AssessmentScaleObservation": {
                "id": [
                    "14581",
                    "14580"
                ],
                "constraint": "may"
            },
            "FunctionalStatusResultObservation": {
                "id": [
                    "14418",
                    "14419"
                ],
                "constraint": "may"
            },
            "CognitiveStatusProblemObservation": {
                "id": [
                    "14425",
                    "14424"
                ],
                "constraint": "may"
            },
            "FunctionalStatusResultOrganizer": {
                "id": [
                    "14414",
                    "14415"
                ],
                "constraint": "may"
            },
            "CaregiverCharacteristics": {
                "id": [
                    "14426",
                    "14427"
                ],
                "constraint": "may"
            },
            "CognitiveStatusResultOrganizer": {
                "id": [
                    "14416",
                    "14417"
                ],
                "constraint": "may"
            },
            "NonMedicinalSupplyActivity": {
                "id": [
                    "14583",
                    "14582"
                ],
                "constraint": "may"
            }
        }
    },
    "PreoperativeDiagnosisSection": {
        "full": {
            "PreoperativeDiagnosis": {
                "id": [
                    "10097",
                    "10096"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "PreoperativeDiagnosis": [
                "10097",
                "10096"
            ]
        }
    },
    "HospitalAdmissionDiagnosisSection": {
        "full": {
            "HospitalAdmissionDiagnosis": {
                "id": [
                    "9935",
                    "9934"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "HospitalAdmissionDiagnosis": [
                "9935",
                "9934"
            ]
        }
    },
    "AllergiesSectionEntriesOptional": {
        "full": {
            "AllergyProblemAct": {
                "id": [
                    "7805",
                    "7804"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "AllergyProblemAct": [
                "7805",
                "7804"
            ]
        }
    },
    "PlannedProcedureSection": {
        "may": {
            "PlanOfCareActivityProcedure": [
                "8766",
                "8744"
            ]
        },
        "full": {
            "PlanOfCareActivityProcedure": {
                "id": [
                    "8766",
                    "8744"
                ],
                "constraint": "may"
            }
        }
    },
    "ProblemSection": {
        "full": {
            "ProblemConcernAct": {
                "id": [
                    "9183"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "ProblemConcernAct": [
                "9183"
            ]
        }
    },
    "EncountersSectionEntriesOptional": {
        "full": {
            "EncounterActivities": {
                "id": [
                    "7951",
                    "8802"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "EncounterActivities": [
                "7951",
                "8802"
            ]
        }
    },
    "HospitalDischargeMedicationsSectionEntriesOptional": {
        "full": {
            "DischargeMedication": {
                "id": [
                    "7883"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "DischargeMedication": [
                "7883"
            ]
        }
    },
    "ProcedureFindingsSection": {
        "may": {
            "ProblemObservation": [
                "8090",
                "8091"
            ]
        },
        "full": {
            "ProblemObservation": {
                "id": [
                    "8090",
                    "8091"
                ],
                "constraint": "may"
            }
        }
    },
    "PlanOfCareSection": {
        "may": {
            "PlanOfCareActivityAct": [
                "7726.",
                "8804"
            ],
            "PlanOfCareActivityProcedure": [
                "8810",
                "8809"
            ],
            "PlanOfCareActivitySubstanceAdministration": [
                "8811",
                "8812"
            ],
            "PlanOfCareActivitySupply": [
                "14756",
                "8813"
            ],
            "PlanOfCareActivityEncounter": [
                "8806",
                "8805"
            ],
            "PlanOfCareActivityObservation": [
                "8808",
                "8807"
            ],
            "Instructions": [
                "14695",
                "16751"
            ]
        },
        "full": {
            "PlanOfCareActivityAct": {
                "id": [
                    "7726.",
                    "8804"
                ],
                "constraint": "may"
            },
            "PlanOfCareActivityProcedure": {
                "id": [
                    "8810",
                    "8809"
                ],
                "constraint": "may"
            },
            "PlanOfCareActivitySubstanceAdministration": {
                "id": [
                    "8811",
                    "8812"
                ],
                "constraint": "may"
            },
            "PlanOfCareActivitySupply": {
                "id": [
                    "14756",
                    "8813"
                ],
                "constraint": "may"
            },
            "PlanOfCareActivityEncounter": {
                "id": [
                    "8806",
                    "8805"
                ],
                "constraint": "may"
            },
            "PlanOfCareActivityObservation": {
                "id": [
                    "8808",
                    "8807"
                ],
                "constraint": "may"
            },
            "Instructions": {
                "id": [
                    "14695",
                    "16751"
                ],
                "constraint": "may"
            }
        }
    },
    "InstructionsSection": {
        "full": {
            "Instructions": {
                "id": [
                    "10116",
                    "10117"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "Instructions": [
                "10116",
                "10117"
            ]
        }
    },
    "ProceduresSection": {
        "may": {
            "ProcedureActivityProcedure": [
                "7896",
                "7895"
            ],
            "ProcedureActivityAct": [
                "8020",
                "8019"
            ],
            "ProcedureActivityObservation": [
                "8018",
                "8017"
            ]
        },
        "full": {
            "ProcedureActivityProcedure": {
                "id": [
                    "7896",
                    "7895"
                ],
                "constraint": "may"
            },
            "ProcedureActivityAct": {
                "id": [
                    "8020",
                    "8019"
                ],
                "constraint": "may"
            },
            "ProcedureActivityObservation": {
                "id": [
                    "8018",
                    "8017"
                ],
                "constraint": "may"
            }
        }
    },
    "HospitalDischargeMedicationsSection": {
        "full": {
            "DischargeMedication": {
                "id": [
                    "7827"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "DischargeMedication": [
                "7827"
            ]
        }
    },
    "PostprocedureDiagnosisSection": {
        "full": {
            "PostprocedureDiagnosis": {
                "id": [
                    "8762",
                    "8764"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "PostprocedureDiagnosis": [
                "8762",
                "8764"
            ]
        }
    },
    "HistoryOfPastIllnessSection": {
        "may": {
            "ProblemObservation": [
                "8792"
            ]
        },
        "full": {
            "ProblemObservation": {
                "id": [
                    "8792"
                ],
                "constraint": "may"
            }
        }
    },
    "ProblemSectionEntriesOptional": {
        "full": {
            "ProblemConcernAct": {
                "id": [
                    "7882"
                ],
                "constraint": "should"
            }
        },
        "should": {
            "ProblemConcernAct": [
                "7882"
            ]
        }
    },
    "FamilyHistorySection": {
        "may": {
            "FamilyHistoryOrganizer": [
                "7955"
            ]
        },
        "full": {
            "FamilyHistoryOrganizer": {
                "id": [
                    "7955"
                ],
                "constraint": "may"
            }
        }
    },
    "ProcedureIndicationsSection": {
        "may": {
            "Indication": [
                "8765",
                "8743"
            ]
        },
        "full": {
            "Indication": {
                "id": [
                    "8765",
                    "8743"
                ],
                "constraint": "may"
            }
        }
    },
    "ProceduresSectionEntriesOptional": {
        "may": {
            "ProcedureActivityProcedure": [
                "15509",
                "6274"
            ],
            "ProcedureActivityAct": [
                "8533",
                "15511"
            ],
            "ProcedureActivityObservation": [
                "6278",
                "15510"
            ]
        },
        "full": {
            "ProcedureActivityProcedure": {
                "id": [
                    "15509",
                    "6274"
                ],
                "constraint": "may"
            },
            "ProcedureActivityAct": {
                "id": [
                    "8533",
                    "15511"
                ],
                "constraint": "may"
            },
            "ProcedureActivityObservation": {
                "id": [
                    "6278",
                    "15510"
                ],
                "constraint": "may"
            }
        }
    },
    "PhysicalExamSection": {
        "may": {
            "PressureUlcerObservation": [
                "17094",
                "17095"
            ],
            "NumberOfPressureUlcersObservation": [
                "17096",
                "17097"
            ],
            "HighestPressureUlcerStage": [
                "17098",
                "17099"
            ]
        },
        "full": {
            "PressureUlcerObservation": {
                "id": [
                    "17094",
                    "17095"
                ],
                "constraint": "may"
            },
            "NumberOfPressureUlcersObservation": {
                "id": [
                    "17096",
                    "17097"
                ],
                "constraint": "may"
            },
            "HighestPressureUlcerStage": {
                "id": [
                    "17098",
                    "17099"
                ],
                "constraint": "may"
            }
        }
    },
    "EncountersSection": {
        "full": {
            "EncounterActivities": {
                "id": [
                    "8709",
                    "8803"
                ],
                "constraint": "shall"
            }
        },
        "shall": {
            "EncounterActivities": [
                "8709",
                "8803"
            ]
        }
    }
};

module.exports = exports = sectionsconstraints;

},{}],30:[function(require,module,exports){
var sections = {
    "AdvanceDirectivesSection": "2.16.840.1.113883.10.20.22.2.21.1",
    "AdvanceDirectivesSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.21",
    "AllergiesSection": "2.16.840.1.113883.10.20.22.2.6.1",
    "AllergiesSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.6",
    "AnesthesiaSection": "2.16.840.1.113883.10.20.22.2.25",
    "AssessmentAndPlanSection": "2.16.840.1.113883.10.20.22.2.9",
    "AssessmentSection": "2.16.840.1.113883.10.20.22.2.8",
    "ChiefComplaintAndReasonForVisitSection": "2.16.840.1.113883.10.20.22.2.13",
    "ChiefComplaintSection": "1.3.6.1.4.1.19376.1.5.3.1.1.13.2.1",
    "ComplicationsSection": "2.16.840.1.113883.10.20.22.2.37",
    "DICOMObjectCatalogSection": "2.16.840.1.113883.10.20.6.1.1",
    "DischargeDietSection": "1.3.6.1.4.1.19376.1.5.3.1.3.33",
    "EncountersSection": "2.16.840.1.113883.10.20.22.2.22.1",
    "EncountersSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.22",
    "FamilyHistorySection": "2.16.840.1.113883.10.20.22.2.15",
    "FindingsSection": "2.16.840.1.113883.10.20.6.1.2",
    "FunctionalStatusSection": "2.16.840.1.113883.10.20.22.2.14",
    "GeneralStatusSection": "2.16.840.1.113883.10.20.2.5",
    "HistoryOfPastIllnessSection": "2.16.840.1.113883.10.20.22.2.20",
    "HistoryOfPresentIllnessSection": "1.3.6.1.4.1.19376.1.5.3.1.3.4",
    "HospitalAdmissionDiagnosisSection": "2.16.840.1.113883.10.20.22.2.43",
    "HospitalAdmissionMedicationsSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.44",
    "HospitalConsultationsSection": "2.16.840.1.113883.10.20.22.2.42",
    "HospitalCourseSection": "1.3.6.1.4.1.19376.1.5.3.1.3.5",
    "HospitalDischargeDiagnosisSection": "2.16.840.1.113883.10.20.22.2.24",
    "HospitalDischargeInstructionsSection": "2.16.840.1.113883.10.20.22.2.41",
    "HospitalDischargeMedicationsSection": "2.16.840.1.113883.10.20.22.2.11.1",
    "HospitalDischargeMedicationsSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.11",
    "HospitalDischargePhysicalSection": "1.3.6.1.4.1.19376.1.5.3.1.3.26",
    "HospitalDischargeStudiesSummarySection": "2.16.840.1.113883.10.20.22.2.16",
    "ImmunizationsSection": "2.16.840.1.113883.10.20.22.2.2.1",
    "ImmunizationsSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.2",
    "InstructionsSection": "2.16.840.1.113883.10.20.22.2.45",
    "InterventionsSection": "2.16.840.1.113883.10.20.21.2.3",
    "MedicalEquipmentSection": "2.16.840.1.113883.10.20.22.2.23",
    "MedicalHistorySection": "2.16.840.1.113883.10.20.22.2.39",
    "MedicationsAdministeredSection": "2.16.840.1.113883.10.20.22.2.38",
    "MedicationsSection": "2.16.840.1.113883.10.20.22.2.1.1",
    "MedicationsSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.1",
    "ObjectiveSection": "2.16.840.1.113883.10.20.21.2.1",
    "OperativeNoteFluidSection": "2.16.840.1.113883.10.20.7.12",
    "OperativeNoteSurgicalProcedureSection": "2.16.840.1.113883.10.20.7.14",
    "PayersSection": "2.16.840.1.113883.10.20.22.2.18",
    "PhysicalExamSection": "2.16.840.1.113883.10.20.2.10",
    "PlannedProcedureSection": "2.16.840.1.113883.10.20.22.2.30",
    "PlanOfCareSection": "2.16.840.1.113883.10.20.22.2.10",
    "PostoperativeDiagnosisSection": "2.16.840.1.113883.10.20.22.2.35",
    "PostprocedureDiagnosisSection": "2.16.840.1.113883.10.20.22.2.36",
    "PreoperativeDiagnosisSection": "2.16.840.1.113883.10.20.22.2.34",
    "ProblemSection": "2.16.840.1.113883.10.20.22.2.5.1",
    "ProblemSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.5",
    "ProcedureDescriptionSection": "2.16.840.1.113883.10.20.22.2.27",
    "ProcedureDispositionSection": "2.16.840.1.113883.10.20.18.2.12",
    "ProcedureEstimatedBloodLossSection": "2.16.840.1.113883.10.20.18.2.9",
    "ProcedureFindingsSection": "2.16.840.1.113883.10.20.22.2.28",
    "ProcedureImplantsSection": "2.16.840.1.113883.10.20.22.2.40",
    "ProcedureIndicationsSection": "2.16.840.1.113883.10.20.22.2.29",
    "ProcedureSpecimensTakenSection": "2.16.840.1.113883.10.20.22.2.31",
    "ProceduresSection": "2.16.840.1.113883.10.20.22.2.7.1",
    "ProceduresSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.7",
    "ReasonForReferralSection": "1.3.6.1.4.1.19376.1.5.3.1.3.1",
    "ReasonForVisitSection": "2.16.840.1.113883.10.20.22.2.12",
    "ResultsSection": "2.16.840.1.113883.10.20.22.2.3.1",
    "ResultsSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.3",
    "ReviewOfSystemsSection": "1.3.6.1.4.1.19376.1.5.3.1.3.18",
    "SocialHistorySection": "2.16.840.1.113883.10.20.22.2.17",
    "SubjectiveSection": "2.16.840.1.113883.10.20.21.2.2",
    "SurgicalDrainsSection": "2.16.840.1.113883.10.20.7.13",
    "VitalSignsSection": "2.16.840.1.113883.10.20.22.2.4.1",
    "VitalSignsSectionEntriesOptional": "2.16.840.1.113883.10.20.22.2.4"
};

var sections_r1 = {
    "AdvanceDirectivesSection": "2.16.840.1.113883.10.20.1.1",
    "AlertsSection": "2.16.840.1.113883.10.20.1.2",
    "EncountersSection": "2.16.840.1.113883.10.20.1.3",
    "FamilyHistorySection": "2.16.840.1.113883.10.20.1.4",
    "FunctionalStatusSection": "2.16.840.1.113883.10.20.1.5",
    "ImmunizationsSection": "2.16.840.1.113883.10.20.1.6",
    "MedicalEquipmentSection": "2.16.840.1.113883.10.20.1.7",
    "MedicationsSection": "2.16.840.1.113883.10.20.1.8",
    "PayersSection": "2.16.840.1.113883.10.20.1.9",
    "PlanOfCareSection": "2.16.840.1.113883.10.20.1.10",
    "ProblemSection": "2.16.840.1.113883.10.20.1.11",
    "ProceduresSection": "2.16.840.1.113883.10.20.1.12",
    "PurposeSection": "2.16.840.1.113883.10.20.1.13",
    "ResultsSection": "2.16.840.1.113883.10.20.1.14",
    "SocialHistorySection": "2.16.840.1.113883.10.20.1.15",
    "VitalSignsSection": "2.16.840.1.113883.10.20.1.16"
};

module.exports.sections = sections;
module.exports.sections_r1 = sections_r1;

},{}],31:[function(require,module,exports){
var templatesconstraints = {
    "ContinuityOfCareDocument": {
        "may": {
            "AdvanceDirectivesSection": "9455",
            "PayersSection": "9468",
            "SocialHistorySection": "9472",
            "ImmunizationsSectionEntriesOptional": "9463",
            "MedicalEquipmentSection": "9466",
            "FamilyHistorySection": "9459",
            "PlanOfCareSection": "9470",
            "FunctionalStatusSection": "9461",
            "VitalSignsSectionEntriesOptional": "9474",
            "EncountersSection": "9457"
        },
        "full": {
            "AdvanceDirectivesSection": {
                "id": "9455",
                "constraint": "may"
            },
            "PayersSection": {
                "id": "9468",
                "constraint": "may"
            },
            "MedicationsSection": {
                "id": "9447",
                "constraint": "shall"
            },
            "ProblemSection": {
                "id": "9449",
                "constraint": "shall"
            },
            "ImmunizationsSectionEntriesOptional": {
                "id": "9463",
                "constraint": "may"
            },
            "SocialHistorySection": {
                "id": "9472",
                "constraint": "may"
            },
            "MedicalEquipmentSection": {
                "id": "9466",
                "constraint": "may"
            },
            "FamilyHistorySection": {
                "id": "9459",
                "constraint": "may"
            },
            "ProceduresSection": {
                "id": "9451",
                "constraint": "shall"
            },
            "PlanOfCareSection": {
                "id": "9470",
                "constraint": "may"
            },
            "FunctionalStatusSection": {
                "id": "9461",
                "constraint": "may"
            },
            "VitalSignsSectionEntriesOptional": {
                "id": "9474",
                "constraint": "may"
            },
            "AllergiesSection": {
                "id": "9445",
                "constraint": "shall"
            },
            "EncountersSection": {
                "id": "9457",
                "constraint": "may"
            },
            "ResultsSection": {
                "id": "9453",
                "constraint": "shall"
            }
        },
        "shall": {
            "ProblemSection": "9449",
            "ResultsSection": "9453",
            "AllergiesSection": "9445",
            "ProceduresSection": "9451",
            "MedicationsSection": "9447"
        }
    },
    "HistoryAndPhysicalNote": {
        "may": {
            "ChiefComplaintSection": "9611",
            "ImmunizationsSectionEntriesOptional": "9637",
            "ProblemSectionEntriesOptional": "9639",
            "ReasonForVisitSection": "9627",
            "ProceduresSectionEntriesOptional": "9641",
            "AssessmentAndPlanSection": "9987",
            "ChiefComplaintAndReasonForVisitSection": "9613",
            "PlanOfCareSection": "9607",
            "InstructionsSection": "16807",
            "AssessmentSection": "9605"
        },
        "should": {
            "HistoryOfPresentIllnessSection": "9621"
        },
        "full": {
            "ChiefComplaintSection": {
                "id": "9611",
                "constraint": "may"
            },
            "ProblemSectionEntriesOptional": {
                "id": "9639",
                "constraint": "may"
            },
            "AllergiesSectionEntriesOptional": {
                "id": "9602",
                "constraint": "shall"
            },
            "FamilyHistorySection": {
                "id": "9615",
                "constraint": "shall"
            },
            "ResultsSectionEntriesOptional": {
                "id": "9629",
                "constraint": "shall"
            },
            "HistoryOfPastIllnessSection": {
                "id": "9619",
                "constraint": "shall"
            },
            "SocialHistorySection": {
                "id": "9633",
                "constraint": "shall"
            },
            "PlanOfCareSection": {
                "id": "9607",
                "constraint": "may"
            },
            "MedicationsSectionEntriesOptional": {
                "id": "9623",
                "constraint": "shall"
            },
            "ReasonForVisitSection": {
                "id": "9627",
                "constraint": "may"
            },
            "ProceduresSectionEntriesOptional": {
                "id": "9641",
                "constraint": "may"
            },
            "AssessmentAndPlanSection": {
                "id": "9987",
                "constraint": "may"
            },
            "GeneralStatusSection": {
                "id": "9617",
                "constraint": "shall"
            },
            "ChiefComplaintAndReasonForVisitSection": {
                "id": "9613",
                "constraint": "may"
            },
            "ImmunizationsSectionEntriesOptional": {
                "id": "9637",
                "constraint": "may"
            },
            "ReviewOfSystemsSection": {
                "id": "9631",
                "constraint": "shall"
            },
            "InstructionsSection": {
                "id": "16807",
                "constraint": "may"
            },
            "PhysicalExamSection": {
                "id": "9625",
                "constraint": "shall"
            },
            "VitalSignsSectionEntriesOptional": {
                "id": "9635",
                "constraint": "shall"
            },
            "AssessmentSection": {
                "id": "9605",
                "constraint": "may"
            },
            "HistoryOfPresentIllnessSection": {
                "id": "9621",
                "constraint": "should"
            }
        },
        "shall": {
            "MedicationsSectionEntriesOptional": "9623",
            "AllergiesSectionEntriesOptional": "9602",
            "ResultsSectionEntriesOptional": "9629",
            "HistoryOfPastIllnessSection": "9619",
            "VitalSignsSectionEntriesOptional": "9635",
            "FamilyHistorySection": "9615",
            "GeneralStatusSection": "9617",
            "ReviewOfSystemsSection": "9631",
            "PhysicalExamSection": "9625",
            "SocialHistorySection": "9633"
        }
    },
    "DischargeSummary": {
        "may": {
            "VitalSignsSectionEntriesOptional": "9584",
            "ChiefComplaintSection": "9554",
            "HospitalDischargePhysicalSection": "9568",
            "HospitalConsultationsSection": "9924",
            "SocialHistorySection": "9582",
            "HistoryOfPastIllnessSection": "9564",
            "HospitalDischargeInstructionsSection": "9926",
            "ProblemSectionEntriesOptional": "9574",
            "HospitalDischargeStudiesSummarySection": "9570",
            "ProceduresSectionEntriesOptional": "9576",
            "FamilyHistorySection": "9560",
            "ReasonForVisitSection": "9578",
            "ChiefComplaintAndReasonForVisitSection": "9556",
            "ImmunizationsSectionEntriesOptional": "9572",
            "FunctionalStatusSection": "9562",
            "HospitalAdmissionMedicationsSectionEntriesOptional": "10111",
            "HistoryOfPresentIllnessSection": "9566",
            "ReviewOfSystemsSection": "9580",
            "DischargeDietSection": "9558"
        },
        "full": {
            "HospitalDischargeDiagnosisSection": {
                "id": "9546",
                "constraint": "shall"
            },
            "SocialHistorySection": {
                "id": "9582",
                "constraint": "may"
            },
            "HospitalDischargeStudiesSummarySection": {
                "id": "9570",
                "constraint": "may"
            },
            "ChiefComplaintAndReasonForVisitSection": {
                "id": "9556",
                "constraint": "may"
            },
            "HospitalAdmissionMedicationsSectionEntriesOptional": {
                "id": "10111",
                "constraint": "may"
            },
            "HistoryOfPresentIllnessSection": {
                "id": "9566",
                "constraint": "may"
            },
            "HospitalConsultationsSection": {
                "id": "9924",
                "constraint": "may"
            },
            "FunctionalStatusSection": {
                "id": "9562",
                "constraint": "may"
            },
            "DischargeDietSection": {
                "id": "9558",
                "constraint": "may"
            },
            "HospitalAdmissionDiagnosisSection": {
                "id": "9928",
                "constraint": "shall"
            },
            "AllergiesSectionEntriesOptional": {
                "id": "9542",
                "constraint": "shall"
            },
            "HospitalDischargePhysicalSection": {
                "id": "9568",
                "constraint": "may"
            },
            "ImmunizationsSectionEntriesOptional": {
                "id": "9572",
                "constraint": "may"
            },
            "ReasonForVisitSection": {
                "id": "9578",
                "constraint": "may"
            },
            "HospitalDischargeMedicationsSectionEntriesOptional": {
                "id": "9548",
                "constraint": "shall"
            },
            "PlanOfCareSection": {
                "id": "9550",
                "constraint": "shall"
            },
            "VitalSignsSectionEntriesOptional": {
                "id": "9584",
                "constraint": "may"
            },
            "HospitalCourseSection": {
                "id": "9544",
                "constraint": "shall"
            },
            "ChiefComplaintSection": {
                "id": "9554",
                "constraint": "may"
            },
            "ProceduresSectionEntriesOptional": {
                "id": "9576",
                "constraint": "may"
            },
            "HospitalDischargeInstructionsSection": {
                "id": "9926",
                "constraint": "may"
            },
            "ProblemSectionEntriesOptional": {
                "id": "9574",
                "constraint": "may"
            },
            "FamilyHistorySection": {
                "id": "9560",
                "constraint": "may"
            },
            "HistoryOfPastIllnessSection": {
                "id": "9564",
                "constraint": "may"
            },
            "ReviewOfSystemsSection": {
                "id": "9580",
                "constraint": "may"
            }
        },
        "shall": {
            "HospitalAdmissionDiagnosisSection": "9928",
            "AllergiesSectionEntriesOptional": "9542",
            "HospitalDischargeDiagnosisSection": "9546",
            "HospitalDischargeMedicationsSectionEntriesOptional": "9548",
            "PlanOfCareSection": "9550",
            "HospitalCourseSection": "9544"
        }
    },
    "OperativeNote": {
        "may": {
            "PlannedProcedureSection": "9906",
            "OperativeNoteFluidSection": "9900",
            "OperativeNoteSurgicalProcedureSection": "9902",
            "SurgicalDrainsSection": "9912",
            "ProcedureDispositionSection": "9908",
            "ProcedureImplantsSection": "9898",
            "ProcedureIndicationsSection": "9910",
            "PlanOfCareSection": "9904"
        },
        "full": {
            "ProcedureSpecimensTakenSection": {
                "id": "9894",
                "constraint": "shall"
            },
            "PlannedProcedureSection": {
                "id": "9906",
                "constraint": "may"
            },
            "OperativeNoteFluidSection": {
                "id": "9900",
                "constraint": "may"
            },
            "OperativeNoteSurgicalProcedureSection": {
                "id": "9902",
                "constraint": "may"
            },
            "ProcedureIndicationsSection": {
                "id": "9910",
                "constraint": "may"
            },
            "SurgicalDrainsSection": {
                "id": "9912",
                "constraint": "may"
            },
            "PostoperativeDiagnosisSection": {
                "id": "9913",
                "constraint": "shall"
            },
            "ProcedureDispositionSection": {
                "id": "9908",
                "constraint": "may"
            },
            "ProcedureEstimatedBloodLossSection": {
                "id": "9890",
                "constraint": "shall"
            },
            "ProcedureImplantsSection": {
                "id": "9898",
                "constraint": "may"
            },
            "ProcedureDescriptionSection": {
                "id": "9896",
                "constraint": "shall"
            },
            "AnesthesiaSection": {
                "id": "9883",
                "constraint": "shall"
            },
            "ProcedureFindingsSection": {
                "id": "9892",
                "constraint": "shall"
            },
            "PlanOfCareSection": {
                "id": "9904",
                "constraint": "may"
            },
            "PreoperativeDiagnosisSection": {
                "id": "9888",
                "constraint": "shall"
            },
            "ComplicationsSection": {
                "id": "9885",
                "constraint": "shall"
            }
        },
        "shall": {
            "ProcedureSpecimensTakenSection": "9894",
            "ProcedureEstimatedBloodLossSection": "9890",
            "PostoperativeDiagnosisSection": "9913",
            "ProcedureDescriptionSection": "9896",
            "AnesthesiaSection": "9883",
            "ProcedureFindingsSection": "9892",
            "PreoperativeDiagnosisSection": "9888",
            "ComplicationsSection": "9885"
        }
    },
    "ProcedureNote": {
        "may": {
            "SocialHistorySection": "9849",
            "ProcedureDispositionSection": "9833",
            "AssessmentAndPlanSection": "9649",
            "ChiefComplaintAndReasonForVisitSection": "9815",
            "HistoryOfPresentIllnessSection": "9821",
            "ProcedureSpecimensTakenSection": "9841",
            "PlannedProcedureSection": "9831",
            "MedicationsSectionEntriesOptional": "9825",
            "MedicationsAdministeredSection": "9827",
            "ProcedureImplantsSection": "9839",
            "AnesthesiaSection": "9811",
            "MedicalHistorySection": "9823",
            "AllergiesSectionEntriesOptional": "9809",
            "ReasonForVisitSection": "9845",
            "ProcedureFindingsSection": "9837",
            "PlanOfCareSection": "9647",
            "ChiefComplaintSection": "9813",
            "ProcedureEstimatedBloodLossSection": "9835",
            "HistoryOfPastIllnessSection": "9819",
            "FamilyHistorySection": "9817",
            "ProceduresSectionEntriesOptional": "9843",
            "ReviewOfSystemsSection": "9847",
            "PhysicalExamSection": "9829",
            "AssessmentSection": "9645"
        },
        "full": {
            "SocialHistorySection": {
                "id": "9849",
                "constraint": "may"
            },
            "ProcedureDispositionSection": {
                "id": "9833",
                "constraint": "may"
            },
            "AssessmentAndPlanSection": {
                "id": "9649",
                "constraint": "may"
            },
            "ChiefComplaintAndReasonForVisitSection": {
                "id": "9815",
                "constraint": "may"
            },
            "ComplicationsSection": {
                "id": "9802",
                "constraint": "shall"
            },
            "HistoryOfPresentIllnessSection": {
                "id": "9821",
                "constraint": "may"
            },
            "ProcedureSpecimensTakenSection": {
                "id": "9841",
                "constraint": "may"
            },
            "PlannedProcedureSection": {
                "id": "9831",
                "constraint": "may"
            },
            "MedicationsSectionEntriesOptional": {
                "id": "9825",
                "constraint": "may"
            },
            "MedicationsAdministeredSection": {
                "id": "9827",
                "constraint": "may"
            },
            "ProcedureImplantsSection": {
                "id": "9839",
                "constraint": "may"
            },
            "ProcedureDescriptionSection": {
                "id": "9805",
                "constraint": "shall"
            },
            "AnesthesiaSection": {
                "id": "9811",
                "constraint": "may"
            },
            "MedicalHistorySection": {
                "id": "9823",
                "constraint": "may"
            },
            "AllergiesSectionEntriesOptional": {
                "id": "9809",
                "constraint": "may"
            },
            "ReasonForVisitSection": {
                "id": "9845",
                "constraint": "may"
            },
            "ProcedureFindingsSection": {
                "id": "9837",
                "constraint": "may"
            },
            "PlanOfCareSection": {
                "id": "9647",
                "constraint": "may"
            },
            "ChiefComplaintSection": {
                "id": "9813",
                "constraint": "may"
            },
            "ProcedureEstimatedBloodLossSection": {
                "id": "9835",
                "constraint": "may"
            },
            "PostprocedureDiagnosisSection": {
                "id": "9850",
                "constraint": "shall"
            },
            "HistoryOfPastIllnessSection": {
                "id": "9819",
                "constraint": "may"
            },
            "FamilyHistorySection": {
                "id": "9817",
                "constraint": "may"
            },
            "ProcedureIndicationsSection": {
                "id": "9807",
                "constraint": "shall"
            },
            "ProceduresSectionEntriesOptional": {
                "id": "9843",
                "constraint": "may"
            },
            "ReviewOfSystemsSection": {
                "id": "9847",
                "constraint": "may"
            },
            "PhysicalExamSection": {
                "id": "9829",
                "constraint": "may"
            },
            "AssessmentSection": {
                "id": "9645",
                "constraint": "may"
            }
        },
        "shall": {
            "ProcedureDescriptionSection": "9805",
            "PostprocedureDiagnosisSection": "9850",
            "ProcedureIndicationsSection": "9807",
            "ComplicationsSection": "9802"
        }
    },
    "DiagnosticImagingReport": {
        "full": {
            "FindingsSection": {
                "id": "8776",
                "constraint": "shall"
            },
            "DICOMObjectCatalogSection": {
                "id": "15141",
                "constraint": "should"
            }
        },
        "shall": {
            "FindingsSection": "8776"
        },
        "should": {
            "DICOMObjectCatalogSection": "15141"
        }
    },
    "ConsultationNote": {
        "may": {
            "ChiefComplaintSection": "9509",
            "AllergiesSectionEntriesOptional": "9507",
            "FamilyHistorySection": "9513",
            "ResultsSectionEntriesOptional": "9527",
            "HistoryOfPastIllnessSection": "9517",
            "SocialHistorySection": "9531",
            "ProblemSectionEntriesOptional": "9523",
            "MedicationsSectionEntriesOptional": "9521)",
            "ImmunizationsSection": "9519",
            "ProceduresSectionEntriesOptional": "9525",
            "AssessmentAndPlanSection": "9491",
            "GeneralStatusSection": "9515",
            "ReasonForVisitSection": "9500",
            "ChiefComplaintAndReasonForVisitSection": "10029",
            "PlanOfCareSection": "9489",
            "ReviewOfSystemsSection": "9529",
            "ReasonForReferralSection": "9498",
            "VitalSignsSectionEntriesOptional": "9533",
            "AssessmentSection": "9487"
        },
        "should": {
            "PhysicalExamSection": "9495"
        },
        "full": {
            "ChiefComplaintSection": {
                "id": "9509",
                "constraint": "may"
            },
            "AllergiesSectionEntriesOptional": {
                "id": "9507",
                "constraint": "may"
            },
            "FamilyHistorySection": {
                "id": "9513",
                "constraint": "may"
            },
            "ResultsSectionEntriesOptional": {
                "id": "9527",
                "constraint": "may"
            },
            "HistoryOfPastIllnessSection": {
                "id": "9517",
                "constraint": "may"
            },
            "SocialHistorySection": {
                "id": "9531",
                "constraint": "may"
            },
            "ProblemSectionEntriesOptional": {
                "id": "9523",
                "constraint": "may"
            },
            "MedicationsSectionEntriesOptional": {
                "id": "9521)",
                "constraint": "may"
            },
            "ImmunizationsSection": {
                "id": "9519",
                "constraint": "may"
            },
            "ProceduresSectionEntriesOptional": {
                "id": "9525",
                "constraint": "may"
            },
            "AssessmentAndPlanSection": {
                "id": "9491",
                "constraint": "may"
            },
            "GeneralStatusSection": {
                "id": "9515",
                "constraint": "may"
            },
            "ReasonForVisitSection": {
                "id": "9500",
                "constraint": "may"
            },
            "ChiefComplaintAndReasonForVisitSection": {
                "id": "10029",
                "constraint": "may"
            },
            "PlanOfCareSection": {
                "id": "9489",
                "constraint": "may"
            },
            "ReviewOfSystemsSection": {
                "id": "9529",
                "constraint": "may"
            },
            "ReasonForReferralSection": {
                "id": "9498",
                "constraint": "may"
            },
            "PhysicalExamSection": {
                "id": "9495",
                "constraint": "should"
            },
            "VitalSignsSectionEntriesOptional": {
                "id": "9533",
                "constraint": "may"
            },
            "AssessmentSection": {
                "id": "9487",
                "constraint": "may"
            },
            "HistoryOfPresentIllnessSection": {
                "id": "9493",
                "constraint": "shall"
            }
        },
        "shall": {
            "HistoryOfPresentIllnessSection": "9493"
        }
    },
    "ProgressNote": {
        "may": {
            "ChiefComplaintSection": "8772",
            "AllergiesSectionEntriesOptional": "8773",
            "ResultsSectionEntriesOptional": "8782",
            "ProblemSectionEntriesOptional": "8786",
            "MedicationsSectionEntriesOptional": "8771",
            "InterventionsSection": "8778",
            "AssessmentAndPlanSection": "8774",
            "ObjectiveSection": "8770",
            "VitalSignsSectionEntriesOptional": "8784",
            "PlanOfCareSection": "8775",
            "ReviewOfSystemsSection": "8788",
            "InstructionsSection": "16806",
            "PhysicalExamSection": "8780",
            "SubjectiveSection": "8790",
            "AssessmentSection": "8776"
        },
        "full": {
            "ChiefComplaintSection": {
                "id": "8772",
                "constraint": "may"
            },
            "AllergiesSectionEntriesOptional": {
                "id": "8773",
                "constraint": "may"
            },
            "ResultsSectionEntriesOptional": {
                "id": "8782",
                "constraint": "may"
            },
            "ProblemSectionEntriesOptional": {
                "id": "8786",
                "constraint": "may"
            },
            "MedicationsSectionEntriesOptional": {
                "id": "8771",
                "constraint": "may"
            },
            "InterventionsSection": {
                "id": "8778",
                "constraint": "may"
            },
            "AssessmentAndPlanSection": {
                "id": "8774",
                "constraint": "may"
            },
            "ObjectiveSection": {
                "id": "8770",
                "constraint": "may"
            },
            "VitalSignsSectionEntriesOptional": {
                "id": "8784",
                "constraint": "may"
            },
            "PlanOfCareSection": {
                "id": "8775",
                "constraint": "may"
            },
            "ReviewOfSystemsSection": {
                "id": "8788",
                "constraint": "may"
            },
            "InstructionsSection": {
                "id": "16806",
                "constraint": "may"
            },
            "PhysicalExamSection": {
                "id": "8780",
                "constraint": "may"
            },
            "SubjectiveSection": {
                "id": "8790",
                "constraint": "may"
            },
            "AssessmentSection": {
                "id": "8776",
                "constraint": "may"
            }
        }
    }
};

module.exports = exports = templatesconstraints;

},{}],32:[function(require,module,exports){
var templates = {
    "ConsultationNote": "2.16.840.1.113883.10.20.22.1.4",
    "ContinuityOfCareDocument": "2.16.840.1.113883.10.20.22.1.2",
    "DiagnosticImagingReport": "2.16.840.1.113883.10.20.22.1.5",
    "DischargeSummary": "2.16.840.1.113883.10.20.22.1.8",
    "HistoryAndPhysicalNote": "2.16.840.1.113883.10.20.22.1.3",
    "OperativeNote": "2.16.840.1.113883.10.20.22.1.7",
    "ProcedureNote": "2.16.840.1.113883.10.20.22.1.6",
    "ProgressNote": "2.16.840.1.113883.10.20.22.1.9",
    "UnstructuredDocument": "2.16.840.1.113883.10.20.21.1.10"
};

module.exports = exports = templates;

},{}],33:[function(require,module,exports){
"use strict";

var oids = require("./oids");

var codeSystem = {
    codeDisplayName: function (code) {
        return this.cs.table && this.cs.table[code];
    },
    displayNameCode: (function () {
        var reverseTables = {};

        return function (name) {
            var oid = this.oid;
            var reverseTable = reverseTables[oid];
            if (!reverseTable) {
                var table = this.cs.table || {};
                reverseTable = Object.keys(table).reduce(function (r, code) {
                    var name = table[code];
                    r[name] = code;
                    return r;
                }, {});
                reverseTables[oid] = reverseTable;
            }
            return reverseTable[name];
        };
    })(),
    name: function () {
        return this.cs.name;
    },
    systemId: function () {
        var systemOID = this.cs.code_system;
        if (systemOID) {
            return {
                codeSystem: systemOID,
                codeSystemName: oids[systemOID].name
            };
        } else {
            return {
                codeSystem: this.oid,
                codeSystemName: this.cs.name
            };
        }
    }
};

exports.find = function (oid) {
    var cs = oids[oid];
    if (cs) {
        var result = Object.create(codeSystem);
        result.oid = oid;
        result.cs = cs;
        return result;
    } else {
        return null;
    }
};

exports.findFromName = (function () {
    var nameIndex;

    return function (name) {
        if (!nameIndex) {
            nameIndex = Object.keys(oids).reduce(function (r, oid) {
                var n = oids[oid].name;
                r[n] = oid;
                return r;
            }, {});
        }
        return nameIndex[name];
    };
})();

},{"./oids":34}],34:[function(require,module,exports){
module.exports = OIDs = {
    "2.16.840.1.113883.11.20.9.19": {
        name: "Problem Status",
        table: {
            "active": "active",
            "suspended": "suspended",
            "aborted": "aborted",
            "completed": "completed"
        }
    },
    "2.16.840.1.113883.5.8": {
        name: "Act Reason",
        table: {
            "IMMUNE": "Immunity",
            "MEDPREC": "Medical precaution",
            "OSTOCK": "Out of stock",
            "PATOBJ": "Patient objection",
            "PHILISOP": "Philosophical objection",
            "RELIG": "Religious objection",
            "VACEFF": "Vaccine efficacy concerns",
            "VACSAF": "Vaccine safety concerns"
        }
    },
    "2.16.840.1.113883.6.103": {
        name: "ICD-9-CM",
        uri: "http://www.cms.gov/medicare-coverage-database/staticpages/icd-9-code-lookup.aspx"
    },
    "2.16.840.1.113883.6.233": {
        name: "US Department of Veterans Affairs",
        uri: "http://www.hl7.org/documentcenter/public_temp_36CB0CDC-1C23-BA17-0C356EB233D41682/standards/vocabulary/vocabulary_tables/infrastructure/vocabulary/voc_ExternalSystems.html"
    },
    "2.16.840.1.113883.6.69": {
        name: "NDC-FDA Drug Registration",
        uri: "http://phinvads.cdc.gov/vads/ViewCodeSystem.action?id=2.16.840.1.113883.6.69"
    },
    "2.16.840.1.113883.6.253": {
        name: "MediSpan DDID"
    },
    "2.16.840.1.113883.6.27": {
        name: "Multum",
        uri: "http://multum-look-me-up#"
    },
    "2.16.840.1.113883.6.312": {
        name: "multum-drug-synonym-id",
        uri: "http://multum-drug-synonym-id-look-me-up#"
    },
    "2.16.840.1.113883.6.314": {
        name: "multum-drug-id",
        uri: "http://multum-drug-id-look-me-up#"
    },
    "2.16.840.1.113883.6.59": {
        name: "CVX Vaccine",
        uri: "http://www2a.cdc.gov/vaccines/iis/iisstandards/vaccines.asp?rpt=cvx&code="
    },
    "2.16.840.1.113883.5.112": {
        name: "Route Code",
        uri: "http://hl7.org/codes/RouteCode#"
    },
    "2.16.840.1.113883.6.255.1336": {
        name: "InsuranceType Code"
    },
    "2.16.840.1.113883.6.1": {
        name: "LOINC",
        uri: "http://purl.bioontology.org/ontology/LNC/"
    },
    "2.16.840.1.113883.6.88": {
        name: "RXNORM",
        uri: "http://purl.bioontology.org/ontology/RXNORM/"
    },
    "2.16.840.1.113883.6.96": {
        name: "SNOMED CT",
        uri: "http://purl.bioontology.org/ontology/SNOMEDCT/",
        table: {
            "55561003": "Active",
            "421139008": "On Hold",
            "392521001": "Prior History",
            "73425007": "No Longer Active"
        }
    },
    "2.16.840.1.113883.6.12": {
        name: "CPT",
        uri: "http://purl.bioontology.org/ontology/CPT/"
    },
    "2.16.840.1.113883.5.4": {
        name: "ActCode",
        uri: "http://hl7.org/actcode/"
    },
    "2.16.840.1.113883.4.9": {
        name: "UNII",
    },
    "2.16.840.1.113883.1.11.78": {
        name: "Observation Interpretation"
    },
    "2.16.840.1.113883.19": {
        name: "Good Health Clinic",
        uri: "http://hl7.org/goodhealth/"
    },
    "2.16.840.1.113883.6.259": {
        name: "HealthcareServiceLocation",
        uri: "http://hl7.org/healthcareservice/"
    },
    "2.16.840.1.113883.1.11.19185": {
        name: "HL7 Religion",
        uri: "http://hl7.org/codes/ReligiousAffiliation#"
    },
    "2.16.840.1.113883.5.60": {
        name: "LanguageAbilityMode",
        uri: "http://hl7.org/codes/LanguageAbility#",
        table: {
            ESGN: "Expressed signed",
            ESP: "Expressed spoken",
            EWR: "Expressed written",
            RSGN: "Received signed",
            RSP: "Received spoken",
            RWR: "Received written"
        }
    },
    "2.16.840.1.113883.5.2": {
        name: "HL7 Marital Status",
        uri: "http://hl7.org/codes/MaritalStatus#"
    },
    "2.16.840.1.113883.5.83": {
        name: "HL7 Result Interpretation",
        uri: "http://hl7.org/codes/ResultInterpretation#",
        table: {
            "B": "better",
            "D": "decreased",
            "U": "increased",
            "W": "worse",
            "<": "low off scale",
            ">": "high off scale",
            "A": "Abnormal",
            "AA": "abnormal alert",
            "H": "High",
            "HH": "high alert",
            "L": "Low",
            "LL": "low alert",
            "N": "Normal",
            "I": "intermediate",
            "MS": "moderately susceptible",
            "R": "resistent",
            "S": "susceptible",
            "VS": "very susceptible",
            "EX": "outside threshold",
            "HX": "above high threshold",
            "LX": "below low threshold",

        }
    },
    "2.16.840.1.113883.5.111": {
        name: "HL7 Role",
        uri: "http://hl7.org/codes/PersonalRelationship#",
        table: {
            "PRN": "Parent"
        }
    },
    "2.16.840.1.113883.5.110": {
        name: "HL7 RoleCode"
    },
    "2.16.840.1.113883.5.1119": {
        name: "HL7 Address",
        uri: "http://hl7.org/codes/Address#",
        table: {
            "BAD": "bad address",
            "CONF": "confidential",
            "DIR": "direct",
            "H": "home address",
            "HP": "primary home",
            "HV": "vacation home",
            "PHYS": "physical visit address",
            "PST": "postal address",
            "PUB": "public",
            "TMP": "temporary",
            "WP": "work place",
            "MC": "mobile contact",
            "PG": "pager",
            "EC": "emergency contact",
            "AS": "answering service"
        }
    },
    "2.16.840.1.113883.5.45": {
        name: "HL7 EntityName",
        uri: "http://hl7.org/codes/EntityName#",
        table: {
            "A": "Artist/Stage",
            "ABC": "Alphabetic",
            "ASGN": "Assigned",
            "C": "License",
            "I": "Indigenous/Tribal",
            "IDE": "Ideographic",
            "L": "Legal",
            "P": "Pseudonym",
            "PHON": "Phonetic",
            "R": "Religious",
            "SNDX": "Soundex",
            "SRCH": "Search",
            "SYL": "Syllabic"
        }
    },
    "2.16.840.1.113883.5.1": {
        name: "HL7 AdministrativeGender",
        uri: "http://hl7.org/codes/AdministrativeGender#",
        table: {
            "F": "Female",
            "M": "Male",
            "UN": "Undifferentiated"
        }
    },
    "2.16.840.1.113883.3.88.12.3221.6.8": {
        name: "Problem Severity",
        uri: "http://purl.bioontology.org/ontology/SNOMEDCT/",
        code_system: "2.16.840.1.113883.6.96",
        table: {
            "255604002": "Mild",
            "371923003": "Mild to moderate",
            "6736007": "Moderate",
            "371924009": "Moderate to severe",
            "24484000": "Severe",
            "399166001": "Fatal"
        }
    },
    "2.16.840.1.113883.3.88.12.80.68": {
        name: "HITSP Problem Status",
        uri: "http://purl.bioontology.org/ontology/SNOMEDCT/",
        code_system: "2.16.840.1.113883.6.96",
        table: {
            "55561003": "Active",
            "73425007": "Inactive",
            "413322009": "Resolved"
        }
    },
    "2.16.840.1.113883.11.20.9.38": {
        name: "Smoking Status/Social History Observation",
        uri: "http://purl.bioontology.org/ontology/SNOMEDCT/",
        code_system: "2.16.840.1.113883.6.96",
        table: {
            "449868002": "Current every day smoker",
            "428041000124106": "Current some day smoker",
            "8517006": "Former smoker",
            "266919005": "Never smoker",
            "77176002": "Smoker, current status unknown",
            "266927001": "Unknown if ever smoked",
            "230056004": "Smoker, current status unknown",
            "229819007": "Tobacco use and exposure",
            "256235009": "Exercise",
            "160573003": "Alcohol intake",
            "364393001": "Nutritional observable",
            "364703007": "Employment detail",
            "425400000": "Toxic exposure status",
            "363908000": "Details of drug misuse behavior",
            "228272008": "Health-related behavior",
            "105421008": "Educational Achievement"
        }
    },
    "2.16.840.1.113883.11.20.9.21": {
        name: "Age Unified Code for Units of Measure",
        uri: "http://phinvads.cdc.gov/vads/ViewValueSet.action?oid=2.16.840.1.114222.4.11.878",
        table: {
            "min": "Minute",
            "h": "Hour",
            "d": "Day",
            "wk": "Week",
            "mo": "Month",
            "a": "Year"
        }
    },
    "2.16.840.1.113883.12.292": {
        name: "CVX",
        uri: "http://phinvads.cdc.gov/vads/ViewCodeSystem.action?id=2.16.840.1.113883.12.292"
    },
    "2.16.840.1.113883.5.1076": {
        name: "HL7 Religious Affiliation",
        uri: "http://ushik.ahrq.gov/ViewItemDetails?system=mdr&itemKey=83154000",
        table: {
            "1008": "Babi & Baha´I faiths",
            "1009": "Baptist",
            "1010": "Bon",
            "1011": "Cao Dai",
            "1012": "Celticism",
            "1013": "Christian (non-Catholic, non-specific)",
            "1014": "Confucianism",
            "1015": "Cyberculture Religions",
            "1016": "Divination",
            "1017": "Fourth Way",
            "1018": "Free Daism",
            "1019": "Gnosis",
            "1020": "Hinduism",
            "1021": "Humanism",
            "1022": "Independent",
            "1023": "Islam",
            "1024": "Jainism",
            "1025": "Jehovah´s Witnesses",
            "1026": "Judaism",
            "1027": "Latter Day Saints",
            "1028": "Lutheran",
            "1029": "Mahayana",
            "1030": "Meditation",
            "1031": "Messianic Judaism",
            "1032": "Mitraism",
            "1033": "New Age",
            "1034": "non-Roman Catholic",
            "1035": "Occult",
            "1036": "Orthodox",
            "1037": "Paganism",
            "1038": "Pentecostal",
            "1039": "Process, The",
            "1040": "Reformed/Presbyterian",
            "1041": "Roman Catholic Church",
            "1042": "Satanism",
            "1043": "Scientology",
            "1044": "Shamanism",
            "1045": "Shiite (Islam)",
            "1046": "Shinto",
            "1047": "Sikism",
            "1048": "Spiritualism",
            "1049": "Sunni (Islam)",
            "1050": "Taoism",
            "1051": "Theravada",
            "1052": "Unitarian-Universalism",
            "1053": "Universal Life Church",
            "1054": "Vajrayana (Tibetan)",
            "1055": "Veda",
            "1056": "Voodoo",
            "1057": "Wicca",
            "1058": "Yaohushua",
            "1059": "Zen Buddhism",
            "1060": "Zoroastrianism",
            "1062": "Brethren",
            "1063": "Christian Scientist",
            "1064": "Church of Christ",
            "1065": "Church of God",
            "1066": "Congregational",
            "1067": "Disciples of Christ",
            "1068": "Eastern Orthodox",
            "1069": "Episcopalian",
            "1070": "Evangelical Covenant",
            "1071": "Friends",
            "1072": "Full Gospel",
            "1073": "Methodist",
            "1074": "Native American",
            "1075": "Nazarene",
            "1076": "Presbyterian",
            "1077": "Protestant",
            "1078": "Protestant, No Denomination",
            "1079": "Reformed",
            "1080": "Salvation Army",
            "1081": "Unitarian Universalist",
            "1082": "United Church of Christ"
        }
    },
    "2.16.840.1.113883.1.11.11526": {
        "name": "Internet Society Language",
        "uri": "http://www.loc.gov/standards/iso639-2/php/English_list.php"
    },
    "2.16.840.1.113883.11.20.9.22": {
        name: "ActStatus",
        table: {
            "completed": "Completed",
            "active": "Active",
            "aborted": "Aborted",
            "cancelled": "Cancelled"
        }
    },
    "2.16.840.1.113883.6.238": {
        name: "Race and Ethnicity - CDC",
        uri: "http://phinvads.cdc.gov/vads/ViewCodeSystemConcept.action?oid=2.16.840.1.113883.6.238&code=",
        table: {
            "1002-5": "American Indian or Alaska Native",
            "2028-9": "Asian",
            "2054-5": "Black or African American",
            "2076-8": "Native Hawaiian or Other Pacific Islander",
            "2106-3": "White",
            "2131-1": "Other Race",
            "1004-1": "American Indian",
            "1735-0": "Alaska Native",
            "2029-7": "Asian Indian",
            "2030-5": "Bangladeshi",
            "2031-3": "Bhutanese",
            "2032-1": "Burmese",
            "2033-9": "Cambodian",
            "2034-7": "Chinese",
            "2035-4": "Taiwanese",
            "2036-2": "Filipino",
            "2037-0": "Hmong",
            "2038-8": "Indonesian",
            "2039-6": "Japanese",
            "2040-4": "Korean",
            "2041-2": "Laotian",
            "2042-0": "Malaysian",
            "2043-8": "Okinawan",
            "2044-6": "Pakistani",
            "2045-3": "Sri Lankan",
            "2046-1": "Thai",
            "2047-9": "Vietnamese",
            "2048-7": "Iwo Jiman",
            "2049-5": "Maldivian",
            "2050-3": "Nepalese",
            "2051-1": "Singaporean",
            "2052-9": "Madagascar",
            "2056-0": "Black",
            "2058-6": "African American",
            "2060-2": "African",
            "2067-7": "Bahamian",
            "2068-5": "Barbadian",
            "2069-3": "Dominican",
            "2070-1": "Dominica Islander",
            "2071-9": "Haitian",
            "2072-7": "Jamaican",
            "2073-5": "Tobagoan",
            "2074-3": "Trinidadian",
            "2075-0": "West Indian",
            "2078-4": "Polynesian",
            "2085-9": "Micronesian",
            "2100-6": "Melanesian",
            "2500-7": "Other Pacific Islander",
            "2108-9": "European",
            "2118-8": "Middle Eastern or North African",
            "2129-5": "Arab",
            "1006-6": "Abenaki",
            "1008-2": "Algonquian",
            "1010-8": "Apache",
            "1021-5": "Arapaho",
            "1026-4": "Arikara",
            "1028-0": "Assiniboine",
            "1030-6": "Assiniboine Sioux",
            "1033-0": "Bannock",
            "1035-5": "Blackfeet",
            "1037-1": "Brotherton",
            "1039-7": "Burt Lake Band",
            "1041-3": "Caddo",
            "1044-7": "Cahuilla",
            "1053-8": "California Tribes",
            "1068-6": "Canadian and Latin American Indian",
            "1076-9": "Catawba",
            "1078-5": "Cayuse",
            "1080-1": "Chehalis",
            "1082-7": "Chemakuan",
            "1086-8": "Chemehuevi",
            "1088-4": "Cherokee",
            "1100-7": "Cherokee Shawnee",
            "1102-3": "Cheyenne",
            "1106-4": "Cheyenne-Arapaho",
            "1108-0": "Chickahominy",
            "1112-2": "Chickasaw",
            "1114-8": "Chinook",
            "1123-9": "Chippewa",
            "1150-2": "Chippewa Cree",
            "1153-6": "Chitimacha",
            "1155-1": "Choctaw",
            "1162-7": "Chumash",
            "1165-0": "Clear Lake",
            "1167-6": "Coeur D'Alene",
            "1169-2": "Coharie",
            "1171-8": "Colorado River",
            "1173-4": "Colville",
            "1175-9": "Comanche",
            "1178-3": "Coos, Lower Umpqua, Siuslaw",
            "1180-9": "Coos",
            "1182-5": "Coquilles",
            "1184-1": "Costanoan",
            "1186-6": "Coushatta",
            "1189-0": "Cowlitz",
            "1191-6": "Cree",
            "1193-2": "Creek",
            "1207-0": "Croatan",
            "1209-6": "Crow",
            "1211-2": "Cupeno",
            "1214-6": "Delaware",
            "1222-9": "Diegueno",
            "1233-6": "Eastern Tribes",
            "1250-0": "Esselen",
            "1252-6": "Fort Belknap",
            "1254-2": "Fort Berthold",
            "1256-7": "Fort Mcdowell",
            "1258-3": "Fort Hall",
            "1260-9": "Gabrieleno",
            "1262-5": "Grand Ronde",
            "1264-1": "Gros Ventres",
            "1267-4": "Haliwa",
            "1269-0": "Hidatsa",
            "1271-6": "Hoopa",
            "1275-7": "Hoopa Extension",
            "1277-3": "Houma",
            "1279-9": "Inaja-Cosmit",
            "1281-5": "Iowa",
            "1285-6": "Iroquois",
            "1297-1": "Juaneno",
            "1299-7": "Kalispel",
            "1301-1": "Karuk",
            "1303-7": "Kaw",
            "1305-2": "Kickapoo",
            "1309-4": "Kiowa",
            "1312-8": "Klallam",
            "1317-7": "Klamath",
            "1319-3": "Konkow",
            "1321-9": "Kootenai",
            "1323-5": "Lassik",
            "1325-0": "Long Island",
            "1331-8": "Luiseno",
            "1340-9": "Lumbee",
            "1342-5": "Lummi",
            "1344-1": "Maidu",
            "1348-2": "Makah",
            "1350-8": "Maliseet",
            "1352-4": "Mandan",
            "1354-0": "Mattaponi",
            "1356-5": "Menominee",
            "1358-1": "Miami",
            "1363-1": "Miccosukee",
            "1365-6": "Micmac",
            "1368-0": "Mission Indians",
            "1370-6": "Miwok",
            "1372-2": "Modoc",
            "1374-8": "Mohegan",
            "1376-3": "Mono",
            "1378-9": "Nanticoke",
            "1380-5": "Narragansett",
            "1382-1": "Navajo",
            "1387-0": "Nez Perce",
            "1389-6": "Nomalaki",
            "1391-2": "Northwest Tribes",
            "1403-5": "Omaha",
            "1405-0": "Oregon Athabaskan",
            "1407-6": "Osage",
            "1409-2": "Otoe-Missouria",
            "1411-8": "Ottawa",
            "1416-7": "Paiute",
            "1439-9": "Pamunkey",
            "1441-5": "Passamaquoddy",
            "1445-6": "Pawnee",
            "1448-0": "Penobscot",
            "1450-6": "Peoria",
            "1453-0": "Pequot",
            "1456-3": "Pima",
            "1460-5": "Piscataway",
            "1462-1": "Pit River",
            "1464-7": "Pomo",
            "1474-6": "Ponca",
            "1478-7": "Potawatomi",
            "1487-8": "Powhatan",
            "1489-4": "Pueblo",
            "1518-0": "Puget Sound Salish",
            "1541-2": "Quapaw",
            "1543-8": "Quinault",
            "1545-3": "Rappahannock",
            "1547-9": "Reno-Sparks",
            "1549-5": "Round Valley",
            "1551-1": "Sac and Fox",
            "1556-0": "Salinan",
            "1558-6": "Salish",
            "1560-2": "Salish and Kootenai",
            "1562-8": "Schaghticoke",
            "1564-4": "Scott Valley",
            "1566-9": "Seminole",
            "1573-5": "Serrano",
            "1576-8": "Shasta",
            "1578-4": "Shawnee",
            "1582-6": "Shinnecock",
            "1584-2": "Shoalwater Bay",
            "1586-7": "Shoshone",
            "1602-2": "Shoshone Paiute",
            "1607-1": "Siletz",
            "1609-7": "Sioux",
            "1643-6": "Siuslaw",
            "1645-1": "Spokane",
            "1647-7": "Stewart",
            "1649-3": "Stockbridge",
            "1651-9": "Susanville",
            "1653-5": "Tohono O'Odham",
            "1659-2": "Tolowa",
            "1661-8": "Tonkawa",
            "1663-4": "Tygh",
            "1665-9": "Umatilla",
            "1667-5": "Umpqua",
            "1670-9": "Ute",
            "1675-8": "Wailaki",
            "1677-4": "Walla-Walla",
            "1679-0": "Wampanoag",
            "1683-2": "Warm Springs",
            "1685-7": "Wascopum",
            "1687-3": "Washoe",
            "1692-3": "Wichita",
            "1694-9": "Wind River",
            "1696-4": "Winnebago",
            "1700-4": "Winnemucca",
            "1702-0": "Wintun",
            "1704-6": "Wiyot",
            "1707-9": "Yakama",
            "1709-5": "Yakama Cowlitz",
            "1711-1": "Yaqui",
            "1715-2": "Yavapai Apache",
            "1717-8": "Yokuts",
            "1722-8": "Yuchi",
            "1724-4": "Yuman",
            "1732-7": "Yurok",
            "1737-6": "Alaska Indian",
            "1840-8": "Eskimo",
            "1966-1": "Aleut",
            "2061-0": "Botswanan",
            "2062-8": "Ethiopian",
            "2063-6": "Liberian",
            "2064-4": "Namibian",
            "2065-1": "Nigerian",
            "2066-9": "Zairean",
            "2079-2": "Native Hawaiian",
            "2080-0": "Samoan",
            "2081-8": "Tahitian",
            "2082-6": "Tongan",
            "2083-4": "Tokelauan",
            "2086-7": "Guamanian or Chamorro",
            "2087-5": "Guamanian",
            "2088-3": "Chamorro",
            "2089-1": "Mariana Islander",
            "2090-9": "Marshallese",
            "2091-7": "Palauan",
            "2092-5": "Carolinian",
            "2093-3": "Kosraean",
            "2094-1": "Pohnpeian",
            "2095-8": "Saipanese",
            "2096-6": "Kiribati",
            "2097-4": "Chuukese",
            "2098-2": "Yapese",
            "2101-4": "Fijian",
            "2102-2": "Papua New Guinean",
            "2103-0": "Solomon Islander",
            "2104-8": "New Hebrides",
            "2109-7": "Armenian",
            "2110-5": "English",
            "2111-3": "French",
            "2112-1": "German",
            "2113-9": "Irish",
            "2114-7": "Italian",
            "2115-4": "Polish",
            "2116-2": "Scottish",
            "2119-6": "Assyrian",
            "2120-4": "Egyptian",
            "2121-2": "Iranian",
            "2122-0": "Iraqi",
            "2123-8": "Lebanese",
            "2124-6": "Palestinian",
            "2125-3": "Syrian",
            "2126-1": "Afghanistani",
            "2127-9": "Israeili",
            "1011-6": "Chiricahua",
            "1012-4": "Fort Sill Apache",
            "1013-2": "Jicarilla Apache",
            "1014-0": "Lipan Apache",
            "1015-7": "Mescalero Apache",
            "1016-5": "Oklahoma Apache",
            "1017-3": "Payson Apache",
            "1018-1": "San Carlos Apache",
            "1019-9": "White Mountain Apache",
            "1022-3": "Northern Arapaho",
            "1023-1": "Southern Arapaho",
            "1024-9": "Wind River Arapaho",
            "1031-4": "Fort Peck Assiniboine Sioux",
            "1042-1": "Oklahoma Cado",
            "1045-4": "Agua Caliente Cahuilla",
            "1046-2": "Augustine",
            "1047-0": "Cabazon",
            "1048-8": "Los Coyotes",
            "1049-6": "Morongo",
            "1050-4": "Santa Rosa Cahuilla",
            "1051-2": "Torres-Martinez",
            "1054-6": "Cahto",
            "1055-3": "Chimariko",
            "1056-1": "Coast Miwok",
            "1057-9": "Digger",
            "1058-7": "Kawaiisu",
            "1059-5": "Kern River",
            "1060-3": "Mattole",
            "1061-1": "Red Wood",
            "1062-9": "Santa Rosa",
            "1063-7": "Takelma",
            "1064-5": "Wappo",
            "1065-2": "Yana",
            "1066-0": "Yuki",
            "1069-4": "Canadian Indian",
            "1070-2": "Central American Indian",
            "1071-0": "French American Indian",
            "1072-8": "Mexican American Indian",
            "1073-6": "South American Indian",
            "1074-4": "Spanish American Indian",
            "1083-5": "Hoh",
            "1084-3": "Quileute",
            "1089-2": "Cherokee Alabama",
            "1090-0": "Cherokees of Northeast Alabama",
            "1091-8": "Cherokees of Southeast Alabama",
            "1092-6": "Eastern Cherokee",
            "1093-4": "Echota Cherokee",
            "1094-2": "Etowah Cherokee",
            "1095-9": "Northern Cherokee",
            "1096-7": "Tuscola",
            "1097-5": "United Keetowah Band of Cherokee",
            "1098-3": "Western Cherokee",
            "1103-1": "Northern Cheyenne",
            "1104-9": "Southern Cheyenne",
            "1109-8": "Eastern Chickahominy",
            "1110-6": "Western Chickahominy",
            "1115-5": "Clatsop",
            "1116-3": "Columbia River Chinook",
            "1117-1": "Kathlamet",
            "1118-9": "Upper Chinook",
            "1119-7": "Wakiakum Chinook",
            "1120-5": "Willapa Chinook",
            "1121-3": "Wishram",
            "1124-7": "Bad River",
            "1125-4": "Bay Mills Chippewa",
            "1126-2": "Bois Forte",
            "1127-0": "Burt Lake Chippewa",
            "1128-8": "Fond du Lac",
            "1129-6": "Grand Portage",
            "1130-4": "Grand Traverse Band of Ottawa/Chippewa",
            "1131-2": "Keweenaw",
            "1132-0": "Lac Courte Oreilles",
            "1133-8": "Lac du Flambeau",
            "1134-6": "Lac Vieux Desert Chippewa",
            "1135-3": "Lake Superior",
            "1136-1": "Leech Lake",
            "1137-9": "Little Shell Chippewa",
            "1138-7": "Mille Lacs",
            "1139-5": "Minnesota Chippewa",
            "1140-3": "Ontonagon",
            "1141-1": "Red Cliff Chippewa",
            "1142-9": "Red Lake Chippewa",
            "1143-7": "Saginaw Chippewa",
            "1144-5": "St. Croix Chippewa",
            "1145-2": "Sault Ste. Marie Chippewa",
            "1146-0": "Sokoagon Chippewa",
            "1147-8": "Turtle Mountain",
            "1148-6": "White Earth",
            "1151-0": "Rocky Boy's Chippewa Cree",
            "1156-9": "Clifton Choctaw",
            "1157-7": "Jena Choctaw",
            "1158-5": "Mississippi Choctaw",
            "1159-3": "Mowa Band of Choctaw",
            "1160-1": "Oklahoma Choctaw",
            "1163-5": "Santa Ynez",
            "1176-7": "Oklahoma Comanche",
            "1187-4": "Alabama Coushatta",
            "1194-0": "Alabama Creek",
            "1195-7": "Alabama Quassarte",
            "1196-5": "Eastern Creek",
            "1197-3": "Eastern Muscogee",
            "1198-1": "Kialegee",
            "1199-9": "Lower Muscogee",
            "1200-5": "Machis Lower Creek Indian",
            "1201-3": "Poarch Band",
            "1202-1": "Principal Creek Indian Nation",
            "1203-9": "Star Clan of Muscogee Creeks",
            "1204-7": "Thlopthlocco",
            "1205-4": "Tuckabachee",
            "1212-0": "Agua Caliente",
            "1215-3": "Eastern Delaware",
            "1216-1": "Lenni-Lenape",
            "1217-9": "Munsee",
            "1218-7": "Oklahoma Delaware",
            "1219-5": "Rampough Mountain",
            "1220-3": "Sand Hill",
            "1223-7": "Campo",
            "1224-5": "Capitan Grande",
            "1225-2": "Cuyapaipe",
            "1226-0": "La Posta",
            "1227-8": "Manzanita",
            "1228-6": "Mesa Grande",
            "1229-4": "San Pasqual",
            "1230-2": "Santa Ysabel",
            "1231-0": "Sycuan",
            "1234-4": "Attacapa",
            "1235-1": "Biloxi",
            "1236-9": "Georgetown (Eastern Tribes)",
            "1237-7": "Moor",
            "1238-5": "Nansemond",
            "1239-3": "Natchez",
            "1240-1": "Nausu Waiwash",
            "1241-9": "Nipmuc",
            "1242-7": "Paugussett",
            "1243-5": "Pocomoke Acohonock",
            "1244-3": "Southeastern Indians",
            "1245-0": "Susquehanock",
            "1246-8": "Tunica Biloxi",
            "1247-6": "Waccamaw-Siousan",
            "1248-4": "Wicomico",
            "1265-8": "Atsina",
            "1272-4": "Trinity",
            "1273-2": "Whilkut",
            "1282-3": "Iowa of Kansas-Nebraska",
            "1283-1": "Iowa of Oklahoma",
            "1286-4": "Cayuga",
            "1287-2": "Mohawk",
            "1288-0": "Oneida",
            "1289-8": "Onondaga",
            "1290-6": "Seneca",
            "1291-4": "Seneca Nation",
            "1292-2": "Seneca-Cayuga",
            "1293-0": "Tonawanda Seneca",
            "1294-8": "Tuscarora",
            "1295-5": "Wyandotte",
            "1306-0": "Oklahoma Kickapoo",
            "1307-8": "Texas Kickapoo",
            "1310-2": "Oklahoma Kiowa",
            "1313-6": "Jamestown",
            "1314-4": "Lower Elwha",
            "1315-1": "Port Gamble Klallam",
            "1326-8": "Matinecock",
            "1327-6": "Montauk",
            "1328-4": "Poospatuck",
            "1329-2": "Setauket",
            "1332-6": "La Jolla",
            "1333-4": "Pala",
            "1334-2": "Pauma",
            "1335-9": "Pechanga",
            "1336-7": "Soboba",
            "1337-5": "Twenty-Nine Palms",
            "1338-3": "Temecula",
            "1345-8": "Mountain Maidu",
            "1346-6": "Nishinam",
            "1359-9": "Illinois Miami",
            "1360-7": "Indiana Miami",
            "1361-5": "Oklahoma Miami",
            "1366-4": "Aroostook",
            "1383-9": "Alamo Navajo",
            "1384-7": "Canoncito Navajo",
            "1385-4": "Ramah Navajo",
            "1392-0": "Alsea",
            "1393-8": "Celilo",
            "1394-6": "Columbia",
            "1395-3": "Kalapuya",
            "1396-1": "Molala",
            "1397-9": "Talakamish",
            "1398-7": "Tenino",
            "1399-5": "Tillamook",
            "1400-1": "Wenatchee",
            "1401-9": "Yahooskin",
            "1412-6": "Burt Lake Ottawa",
            "1413-4": "Michigan Ottawa",
            "1414-2": "Oklahoma Ottawa",
            "1417-5": "Bishop",
            "1418-3": "Bridgeport",
            "1419-1": "Burns Paiute",
            "1420-9": "Cedarville",
            "1421-7": "Fort Bidwell",
            "1422-5": "Fort Independence",
            "1423-3": "Kaibab",
            "1424-1": "Las Vegas",
            "1425-8": "Lone Pine",
            "1426-6": "Lovelock",
            "1427-4": "Malheur Paiute",
            "1428-2": "Moapa",
            "1429-0": "Northern Paiute",
            "1430-8": "Owens Valley",
            "1431-6": "Pyramid Lake",
            "1432-4": "San Juan Southern Paiute",
            "1433-2": "Southern Paiute",
            "1434-0": "Summit Lake",
            "1435-7": "Utu Utu Gwaitu Paiute",
            "1436-5": "Walker River",
            "1437-3": "Yerington Paiute",
            "1442-3": "Indian Township",
            "1443-1": "Pleasant Point Passamaquoddy",
            "1446-4": "Oklahoma Pawnee",
            "1451-4": "Oklahoma Peoria",
            "1454-8": "Marshantucket Pequot",
            "1457-1": "Gila River Pima-Maricopa",
            "1458-9": "Salt River Pima-Maricopa",
            "1465-4": "Central Pomo",
            "1466-2": "Dry Creek",
            "1467-0": "Eastern Pomo",
            "1468-8": "Kashia",
            "1469-6": "Northern Pomo",
            "1470-4": "Scotts Valley",
            "1471-2": "Stonyford",
            "1472-0": "Sulphur Bank",
            "1475-3": "Nebraska Ponca",
            "1476-1": "Oklahoma Ponca",
            "1479-5": "Citizen Band Potawatomi",
            "1480-3": "Forest County",
            "1481-1": "Hannahville",
            "1482-9": "Huron Potawatomi",
            "1483-7": "Pokagon Potawatomi",
            "1484-5": "Prairie Band",
            "1485-2": "Wisconsin Potawatomi",
            "1490-2": "Acoma",
            "1491-0": "Arizona Tewa",
            "1492-8": "Cochiti",
            "1493-6": "Hopi",
            "1494-4": "Isleta",
            "1495-1": "Jemez",
            "1496-9": "Keres",
            "1497-7": "Laguna",
            "1498-5": "Nambe",
            "1499-3": "Picuris",
            "1500-8": "Piro",
            "1501-6": "Pojoaque",
            "1502-4": "San Felipe",
            "1503-2": "San Ildefonso",
            "1504-0": "San Juan Pueblo",
            "1505-7": "San Juan De",
            "1506-5": "San Juan",
            "1507-3": "Sandia",
            "1508-1": "Santa Ana",
            "1509-9": "Santa Clara",
            "1510-7": "Santo Domingo",
            "1511-5": "Taos",
            "1512-3": "Tesuque",
            "1513-1": "Tewa",
            "1514-9": "Tigua",
            "1515-6": "Zia",
            "1516-4": "Zuni",
            "1519-8": "Duwamish",
            "1520-6": "Kikiallus",
            "1521-4": "Lower Skagit",
            "1522-2": "Muckleshoot",
            "1523-0": "Nisqually",
            "1524-8": "Nooksack",
            "1525-5": "Port Madison",
            "1526-3": "Puyallup",
            "1527-1": "Samish",
            "1528-9": "Sauk-Suiattle",
            "1529-7": "Skokomish",
            "1530-5": "Skykomish",
            "1531-3": "Snohomish",
            "1532-1": "Snoqualmie",
            "1533-9": "Squaxin Island",
            "1534-7": "Steilacoom",
            "1535-4": "Stillaguamish",
            "1536-2": "Suquamish",
            "1537-0": "Swinomish",
            "1538-8": "Tulalip",
            "1539-6": "Upper Skagit",
            "1552-9": "Iowa Sac and Fox",
            "1553-7": "Missouri Sac and Fox",
            "1554-5": "Oklahoma Sac and Fox",
            "1567-7": "Big Cypress",
            "1568-5": "Brighton",
            "1569-3": "Florida Seminole",
            "1570-1": "Hollywood Seminole",
            "1571-9": "Oklahoma Seminole",
            "1574-3": "San Manual",
            "1579-2": "Absentee Shawnee",
            "1580-0": "Eastern Shawnee",
            "1587-5": "Battle Mountain",
            "1588-3": "Duckwater",
            "1589-1": "Elko",
            "1590-9": "Ely",
            "1591-7": "Goshute",
            "1592-5": "Panamint",
            "1593-3": "Ruby Valley",
            "1594-1": "Skull Valley",
            "1595-8": "South Fork Shoshone",
            "1596-6": "Te-Moak Western Shoshone",
            "1597-4": "Timbi-Sha Shoshone",
            "1598-2": "Washakie",
            "1599-0": "Wind River Shoshone",
            "1600-6": "Yomba",
            "1603-0": "Duck Valley",
            "1604-8": "Fallon",
            "1605-5": "Fort McDermitt",
            "1610-5": "Blackfoot Sioux",
            "1611-3": "Brule Sioux",
            "1612-1": "Cheyenne River Sioux",
            "1613-9": "Crow Creek Sioux",
            "1614-7": "Dakota Sioux",
            "1615-4": "Flandreau Santee",
            "1616-2": "Fort Peck",
            "1617-0": "Lake Traverse Sioux",
            "1618-8": "Lower Brule Sioux",
            "1619-6": "Lower Sioux",
            "1620-4": "Mdewakanton Sioux",
            "1621-2": "Miniconjou",
            "1622-0": "Oglala Sioux",
            "1623-8": "Pine Ridge Sioux",
            "1624-6": "Pipestone Sioux",
            "1625-3": "Prairie Island Sioux",
            "1626-1": "Prior Lake Sioux",
            "1627-9": "Rosebud Sioux",
            "1628-7": "Sans Arc Sioux",
            "1629-5": "Santee Sioux",
            "1630-3": "Sisseton-Wahpeton",
            "1631-1": "Sisseton Sioux",
            "1632-9": "Spirit Lake Sioux",
            "1633-7": "Standing Rock Sioux",
            "1634-5": "Teton Sioux",
            "1635-2": "Two Kettle Sioux",
            "1636-0": "Upper Sioux",
            "1637-8": "Wahpekute Sioux",
            "1638-6": "Wahpeton Sioux",
            "1639-4": "Wazhaza Sioux",
            "1640-2": "Yankton Sioux",
            "1641-0": "Yanktonai Sioux",
            "1654-3": "Ak-Chin",
            "1655-0": "Gila Bend",
            "1656-8": "San Xavier",
            "1657-6": "Sells",
            "1668-3": "Cow Creek Umpqua",
            "1671-7": "Allen Canyon",
            "1672-5": "Uintah Ute",
            "1673-3": "Ute Mountain Ute",
            "1680-8": "Gay Head Wampanoag",
            "1681-6": "Mashpee Wampanoag",
            "1688-1": "Alpine",
            "1689-9": "Carson",
            "1690-7": "Dresslerville",
            "1697-2": "Ho-chunk",
            "1698-0": "Nebraska Winnebago",
            "1705-3": "Table Bluff",
            "1712-9": "Barrio Libre",
            "1713-7": "Pascua Yaqui",
            "1718-6": "Chukchansi",
            "1719-4": "Tachi",
            "1720-2": "Tule River",
            "1725-1": "Cocopah",
            "1726-9": "Havasupai",
            "1727-7": "Hualapai",
            "1728-5": "Maricopa",
            "1729-3": "Mohave",
            "1730-1": "Quechan",
            "1731-9": "Yavapai",
            "1733-5": "Coast Yurok",
            "1739-2": "Alaskan Athabascan",
            "1811-9": "Southeast Alaska",
            "1842-4": "Greenland Eskimo",
            "1844-0": "Inupiat Eskimo",
            "1891-1": "Siberian Eskimo",
            "1896-0": "Yupik Eskimo",
            "1968-7": "Alutiiq Aleut",
            "1972-9": "Bristol Bay Aleut",
            "1984-4": "Chugach Aleut",
            "1990-1": "Eyak",
            "1992-7": "Koniag Aleut",
            "2002-4": "Sugpiaq",
            "2004-0": "Suqpigaq",
            "2006-5": "Unangan Aleut",
            "1740-0": "Ahtna",
            "1741-8": "Alatna",
            "1742-6": "Alexander",
            "1743-4": "Allakaket",
            "1744-2": "Alanvik",
            "1745-9": "Anvik",
            "1746-7": "Arctic",
            "1747-5": "Beaver",
            "1748-3": "Birch Creek",
            "1749-1": "Cantwell",
            "1750-9": "Chalkyitsik",
            "1751-7": "Chickaloon",
            "1752-5": "Chistochina",
            "1753-3": "Chitina",
            "1754-1": "Circle",
            "1755-8": "Cook Inlet",
            "1756-6": "Copper Center",
            "1757-4": "Copper River",
            "1758-2": "Dot Lake",
            "1759-0": "Doyon",
            "1760-8": "Eagle",
            "1761-6": "Eklutna",
            "1762-4": "Evansville",
            "1763-2": "Fort Yukon",
            "1764-0": "Gakona",
            "1765-7": "Galena",
            "1766-5": "Grayling",
            "1767-3": "Gulkana",
            "1768-1": "Healy Lake",
            "1769-9": "Holy Cross",
            "1770-7": "Hughes",
            "1771-5": "Huslia",
            "1772-3": "Iliamna",
            "1773-1": "Kaltag",
            "1774-9": "Kluti Kaah",
            "1775-6": "Knik",
            "1776-4": "Koyukuk",
            "1777-2": "Lake Minchumina",
            "1778-0": "Lime",
            "1779-8": "Mcgrath",
            "1780-6": "Manley Hot Springs",
            "1781-4": "Mentasta Lake",
            "1782-2": "Minto",
            "1783-0": "Nenana",
            "1784-8": "Nikolai",
            "1785-5": "Ninilchik",
            "1786-3": "Nondalton",
            "1787-1": "Northway",
            "1788-9": "Nulato",
            "1789-7": "Pedro Bay",
            "1790-5": "Rampart",
            "1791-3": "Ruby",
            "1792-1": "Salamatof",
            "1793-9": "Seldovia",
            "1794-7": "Slana",
            "1795-4": "Shageluk",
            "1796-2": "Stevens",
            "1797-0": "Stony River",
            "1798-8": "Takotna",
            "1799-6": "Tanacross",
            "1800-2": "Tanaina",
            "1801-0": "Tanana",
            "1802-8": "Tanana Chiefs",
            "1803-6": "Tazlina",
            "1804-4": "Telida",
            "1805-1": "Tetlin",
            "1806-9": "Tok",
            "1807-7": "Tyonek",
            "1808-5": "Venetie",
            "1809-3": "Wiseman",
            "1813-5": "Tlingit-Haida",
            "1837-4": "Tsimshian",
            "1845-7": "Ambler",
            "1846-5": "Anaktuvuk",
            "1847-3": "Anaktuvuk Pass",
            "1848-1": "Arctic Slope Inupiat",
            "1849-9": "Arctic Slope Corporation",
            "1850-7": "Atqasuk",
            "1851-5": "Barrow",
            "1852-3": "Bering Straits Inupiat",
            "1853-1": "Brevig Mission",
            "1854-9": "Buckland",
            "1855-6": "Chinik",
            "1856-4": "Council",
            "1857-2": "Deering",
            "1858-0": "Elim",
            "1859-8": "Golovin",
            "1860-6": "Inalik Diomede",
            "1861-4": "Inupiaq",
            "1862-2": "Kaktovik",
            "1863-0": "Kawerak",
            "1864-8": "Kiana",
            "1865-5": "Kivalina",
            "1866-3": "Kobuk",
            "1867-1": "Kotzebue",
            "1868-9": "Koyuk",
            "1869-7": "Kwiguk",
            "1870-5": "Mauneluk Inupiat",
            "1871-3": "Nana Inupiat",
            "1872-1": "Noatak",
            "1873-9": "Nome",
            "1874-7": "Noorvik",
            "1875-4": "Nuiqsut",
            "1876-2": "Point Hope",
            "1877-0": "Point Lay",
            "1878-8": "Selawik",
            "1879-6": "Shaktoolik",
            "1880-4": "Shishmaref",
            "1881-2": "Shungnak",
            "1882-0": "Solomon",
            "1883-8": "Teller",
            "1884-6": "Unalakleet",
            "1885-3": "Wainwright",
            "1886-1": "Wales",
            "1887-9": "White Mountain",
            "1888-7": "White Mountain Inupiat",
            "1889-5": "Mary's Igloo",
            "1892-9": "Gambell",
            "1893-7": "Savoonga",
            "1894-5": "Siberian Yupik",
            "1897-8": "Akiachak",
            "1898-6": "Akiak",
            "1899-4": "Alakanuk",
            "1900-0": "Aleknagik",
            "1901-8": "Andreafsky",
            "1902-6": "Aniak",
            "1903-4": "Atmautluak",
            "1904-2": "Bethel",
            "1905-9": "Bill Moore's Slough",
            "1906-7": "Bristol Bay Yupik",
            "1907-5": "Calista Yupik",
            "1908-3": "Chefornak",
            "1909-1": "Chevak",
            "1910-9": "Chuathbaluk",
            "1911-7": "Clark's Point",
            "1912-5": "Crooked Creek",
            "1913-3": "Dillingham",
            "1914-1": "Eek",
            "1915-8": "Ekuk",
            "1916-6": "Ekwok",
            "1917-4": "Emmonak",
            "1918-2": "Goodnews Bay",
            "1919-0": "Hooper Bay",
            "1920-8": "Iqurmuit (Russian Mission)",
            "1921-6": "Kalskag",
            "1922-4": "Kasigluk",
            "1923-2": "Kipnuk",
            "1924-0": "Koliganek",
            "1925-7": "Kongiganak",
            "1926-5": "Kotlik",
            "1927-3": "Kwethluk",
            "1928-1": "Kwigillingok",
            "1929-9": "Levelock",
            "1930-7": "Lower Kalskag",
            "1931-5": "Manokotak",
            "1932-3": "Marshall",
            "1933-1": "Mekoryuk",
            "1934-9": "Mountain Village",
            "1935-6": "Naknek",
            "1936-4": "Napaumute",
            "1937-2": "Napakiak",
            "1938-0": "Napaskiak",
            "1939-8": "Newhalen",
            "1940-6": "New Stuyahok",
            "1941-4": "Newtok",
            "1942-2": "Nightmute",
            "1943-0": "Nunapitchukv",
            "1944-8": "Oscarville",
            "1945-5": "Pilot Station",
            "1946-3": "Pitkas Point",
            "1947-1": "Platinum",
            "1948-9": "Portage Creek",
            "1949-7": "Quinhagak",
            "1950-5": "Red Devil",
            "1951-3": "St. Michael",
            "1952-1": "Scammon Bay",
            "1953-9": "Sheldon's Point",
            "1954-7": "Sleetmute",
            "1955-4": "Stebbins",
            "1956-2": "Togiak",
            "1957-0": "Toksook",
            "1958-8": "Tulukskak",
            "1959-6": "Tuntutuliak",
            "1960-4": "Tununak",
            "1961-2": "Twin Hills",
            "1962-0": "Georgetown (Yupik-Eskimo)",
            "1963-8": "St. Mary's",
            "1964-6": "Umkumiate",
            "1969-5": "Tatitlek",
            "1970-3": "Ugashik",
            "1973-7": "Chignik",
            "1974-5": "Chignik Lake",
            "1975-2": "Egegik",
            "1976-0": "Igiugig",
            "1977-8": "Ivanof Bay",
            "1978-6": "King Salmon",
            "1979-4": "Kokhanok",
            "1980-2": "Perryville",
            "1981-0": "Pilot Point",
            "1982-8": "Port Heiden",
            "1985-1": "Chenega",
            "1986-9": "Chugach Corporation",
            "1987-7": "English Bay",
            "1988-5": "Port Graham",
            "1993-5": "Akhiok",
            "1994-3": "Agdaagux",
            "1995-0": "Karluk",
            "1996-8": "Kodiak",
            "1997-6": "Larsen Bay",
            "1998-4": "Old Harbor",
            "1999-2": "Ouzinkie",
            "2000-8": "Port Lions",
            "2007-3": "Akutan",
            "2008-1": "Aleut Corporation",
            "2009-9": "Aleutian",
            "2010-7": "Aleutian Islander",
            "2011-5": "Atka",
            "2012-3": "Belkofski",
            "2013-1": "Chignik Lagoon",
            "2014-9": "King Cove",
            "2015-6": "False Pass",
            "2016-4": "Nelson Lagoon",
            "2017-2": "Nikolski",
            "2018-0": "Pauloff Harbor",
            "2019-8": "Qagan Toyagungin",
            "2020-6": "Qawalangin",
            "2021-4": "St. George",
            "2022-2": "St. Paul",
            "2023-0": "Sand Point",
            "2024-8": "South Naknek",
            "2025-5": "Unalaska",
            "2026-3": "Unga",
            "1814-3": "Angoon",
            "1815-0": "Central Council of Tlingit and Haida Tribes",
            "1816-8": "Chilkat",
            "1817-6": "Chilkoot",
            "1818-4": "Craig",
            "1819-2": "Douglas",
            "1820-0": "Haida",
            "1821-8": "Hoonah",
            "1822-6": "Hydaburg",
            "1823-4": "Kake",
            "1824-2": "Kasaan",
            "1825-9": "Kenaitze",
            "1826-7": "Ketchikan",
            "1827-5": "Klawock",
            "1828-3": "Pelican",
            "1829-1": "Petersburg",
            "1830-9": "Saxman",
            "1831-7": "Sitka",
            "1832-5": "Tenakee Springs",
            "1833-3": "Tlingit",
            "1834-1": "Wrangell",
            "1835-8": "Yakutat",
            "1838-2": "Metlakatla",
            "2135-2": "Hispanic or Latino"
        }
    },
    "2.16.840.1.113883.3.26.1.1": {
        name: "Medication Route FDA",
        uri: "http://nci-thesaurus-look-me-up#",
        table: {
            "C38192": "AURICULAR (OTIC)",
            "C38193": "BUCCAL",
            "C38194": "CONJUNCTIVAL",
            "C38675": "CUTANEOUS",
            "C38197": "DENTAL",
            "C38633": "ELECTRO-OSMOSIS",
            "C38205": "ENDOCERVICAL",
            "C38206": "ENDOSINUSIAL",
            "C38208": "ENDOTRACHEAL",
            "C38209": "ENTERAL",
            "C38210": "EPIDURAL",
            "C38211": "EXTRA-AMNIOTIC",
            "C38212": "EXTRACORPOREAL",
            "C38200": "HEMODIALYSIS",
            "C38215": "INFILTRATION",
            "C38219": "INTERSTITIAL",
            "C38220": "INTRA-ABDOMINAL",
            "C38221": "INTRA-AMNIOTIC",
            "C38222": "INTRA-ARTERIAL",
            "C38223": "INTRA-ARTICULAR",
            "C38224": "INTRABILIARY",
            "C38225": "INTRABRONCHIAL",
            "C38226": "INTRABURSAL",
            "C38227": "INTRACARDIAC",
            "C38228": "INTRACARTILAGINOUS",
            "C38229": "INTRACAUDAL",
            "C38230": "INTRACAVERNOUS",
            "C38231": "INTRACAVITARY",
            "C38232": "INTRACEREBRAL",
            "C38233": "INTRACISTERNAL",
            "C38234": "INTRACORNEAL",
            "C38217": "INTRACORONAL, DENTAL",
            "C38218": "INTRACORONARY",
            "C38235": "INTRACORPORUS CAVERNOSUM",
            "C38238": "INTRADERMAL",
            "C38239": "INTRADISCAL",
            "C38240": "INTRADUCTAL",
            "C38241": "INTRADUODENAL",
            "C38242": "INTRADURAL",
            "C38243": "INTRAEPIDERMAL",
            "C38245": "INTRAESOPHAGEAL",
            "C38246": "INTRAGASTRIC",
            "C38247": "INTRAGINGIVAL",
            "C38249": "INTRAILEAL",
            "C38250": "INTRALESIONAL",
            "C38251": "INTRALUMINAL",
            "C38252": "INTRALYMPHATIC",
            "C38253": "INTRAMEDULLARY",
            "C38254": "INTRAMENINGEAL",
            "C28161": "INTRAMUSCULAR",
            "C38255": "INTRAOCULAR",
            "C38256": "INTRAOVARIAN",
            "C38257": "INTRAPERICARDIAL",
            "C38258": "INTRAPERITONEAL",
            "C38259": "INTRAPLEURAL",
            "C38260": "INTRAPROSTATIC",
            "C38261": "INTRAPULMONARY",
            "C38262": "INTRASINAL",
            "C38263": "INTRASPINAL",
            "C38264": "INTRASYNOVIAL",
            "C38265": "INTRATENDINOUS",
            "C38266": "INTRATESTICULAR",
            "C38267": "INTRATHECAL",
            "C38207": "INTRATHORACIC",
            "C38268": "INTRATUBULAR",
            "C38269": "INTRATUMOR",
            "C38270": "INTRATYMPANIC",
            "C38272": "INTRAUTERINE",
            "C38273": "INTRAVASCULAR",
            "C38276": "INTRAVENOUS",
            "C38277": "INTRAVENTRICULAR",
            "C38278": "INTRAVESICAL",
            "C38280": "INTRAVITREAL",
            "C38203": "IONTOPHORESIS",
            "C38281": "IRRIGATION",
            "C38282": "LARYNGEAL",
            "C38284": "NASAL",
            "C38285": "NASOGASTRIC",
            "C48623": "NOT APPLICABLE",
            "C38286": "OCCLUSIVE DRESSING TECHNIQUE",
            "C38287": "OPHTHALMIC",
            "C38288": "ORAL",
            "C38289": "OROPHARYNGEAL",
            "C38291": "PARENTERAL",
            "C38676": "PERCUTANEOUS",
            "C38292": "PERIARTICULAR",
            "C38677": "PERIDURAL",
            "C38293": "PERINEURAL",
            "C38294": "PERIODONTAL",
            "C38295": "RECTAL",
            "C38216": "RESPIRATORY (INHALATION)",
            "C38296": "RETROBULBAR",
            "C38198": "SOFT TISSUE",
            "C38297": "SUBARACHNOID",
            "C38298": "SUBCONJUNCTIVAL",
            "C38299": "SUBCUTANEOUS",
            "C38300": "SUBLINGUAL",
            "C38301": "SUBMUCOSAL",
            "C38304": "TOPICAL",
            "C38305": "TRANSDERMAL",
            "C38283": "TRANSMUCOSAL",
            "C38307": "TRANSPLACENTAL",
            "C38308": "TRANSTRACHEAL",
            "C38309": "TRANSTYMPANIC",
            "C38312": "URETERAL",
            "C38271": "URETHRAL"
        }
    },
    "2.16.840.1.113883.11.20.9.33": {
        name: "IND Roleclass Codes",
        uri: "",
        code_system: "2.16.840.1.113883.5.110",
        table: {
            "PRS": "Personal Relationship",
            "NOK": "Next of Kin",
            "CAREGIVER": "Caregiver",
            "AGNT": "Agent",
            "GUAR": "Guarantor",
            "ECON": "Emergency Contact"
        }
    },
    "2.16.840.1.113883.5.139": {
        name: "Domain TimingEvent",
        table: {
            //https://groups.google.com/forum/#!msg/ccda_samples/WawmwNMYT_8/pqnp5bG1IygJ
            "AC": "before meal",
            "ACD": "before lunch",
            "ACM": "before breakfast",
            "ACV": "before dinner",
            "C": "with meal",
            "CD": "with lunch",
            "CM": "with breakfast",
            "CV": "with dinner",
            "HS": "at bedtime",
            "IC": "between meals",
            "ICD": "between lunch and dinner",
            "ICM": "between breakfast and lunch",
            "ICV": "between dinner and bedtime",
            "PC": "after meal",
            "PCD": "after lunch",
            "PCM": "after breakfast",
            "PCV": "after dinner",
            "WAKE": "upon waking"
        }
    },
    "2.16.840.1.113883.6.14": {
        name: "HCPCS",
        uri: "http://www.cms.gov/Medicare/Coding/MedHCPCSGenInfo/index.html?redirect=/medhcpcsgeninfo/"
    },
    "2.16.840.1.113883.3.88.12.3221.8.9": {
        name: "Body Site Value Set"
    },
    "2.16.840.1.113883.5.7": {
        name: "ActPriority"
    }
};

},{}],35:[function(require,module,exports){
module.exports = require('./lib/chai');

},{"./lib/chai":36}],36:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var used = []
  , exports = module.exports = {};

/*!
 * Chai version
 */

exports.version = '1.10.0';

/*!
 * Assertion Error
 */

exports.AssertionError = require('assertion-error');

/*!
 * Utils for plugins (not exported)
 */

var util = require('./chai/utils');

/**
 * # .use(function)
 *
 * Provides a way to extend the internals of Chai
 *
 * @param {Function}
 * @returns {this} for chaining
 * @api public
 */

exports.use = function (fn) {
  if (!~used.indexOf(fn)) {
    fn(this, util);
    used.push(fn);
  }

  return this;
};

/*!
 * Configuration
 */

var config = require('./chai/config');
exports.config = config;

/*!
 * Primary `Assertion` prototype
 */

var assertion = require('./chai/assertion');
exports.use(assertion);

/*!
 * Core Assertions
 */

var core = require('./chai/core/assertions');
exports.use(core);

/*!
 * Expect interface
 */

var expect = require('./chai/interface/expect');
exports.use(expect);

/*!
 * Should interface
 */

var should = require('./chai/interface/should');
exports.use(should);

/*!
 * Assert interface
 */

var assert = require('./chai/interface/assert');
exports.use(assert);

},{"./chai/assertion":37,"./chai/config":38,"./chai/core/assertions":39,"./chai/interface/assert":40,"./chai/interface/expect":41,"./chai/interface/should":42,"./chai/utils":53,"assertion-error":62}],37:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('./config');
var NOOP = function() { };

module.exports = function (_chai, util) {
  /*!
   * Module dependencies.
   */

  var AssertionError = _chai.AssertionError
    , flag = util.flag;

  /*!
   * Module export.
   */

  _chai.Assertion = Assertion;

  /*!
   * Assertion Constructor
   *
   * Creates object for chaining.
   *
   * @api private
   */

  function Assertion (obj, msg, stack) {
    flag(this, 'ssfi', stack || arguments.callee);
    flag(this, 'object', obj);
    flag(this, 'message', msg);
  }

  Object.defineProperty(Assertion, 'includeStack', {
    get: function() {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      return config.includeStack;
    },
    set: function(value) {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      config.includeStack = value;
    }
  });

  Object.defineProperty(Assertion, 'showDiff', {
    get: function() {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      return config.showDiff;
    },
    set: function(value) {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      config.showDiff = value;
    }
  });

  Assertion.addProperty = function (name, fn) {
    util.addProperty(this.prototype, name, fn);
  };

  Assertion.addMethod = function (name, fn) {
    util.addMethod(this.prototype, name, fn);
  };

  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  Assertion.addChainableNoop = function(name, fn) {
    util.addChainableMethod(this.prototype, name, NOOP, fn);
  };

  Assertion.overwriteProperty = function (name, fn) {
    util.overwriteProperty(this.prototype, name, fn);
  };

  Assertion.overwriteMethod = function (name, fn) {
    util.overwriteMethod(this.prototype, name, fn);
  };

  Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {
    util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  /*!
   * ### .assert(expression, message, negateMessage, expected, actual)
   *
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
   *
   * @name assert
   * @param {Philosophical} expression to be tested
   * @param {String or Function} message or function that returns message to display if fails
   * @param {String or Function} negatedMessage or function that returns negatedMessage to display if negated expression fails
   * @param {Mixed} expected value (remember to check for negation)
   * @param {Mixed} actual (optional) will default to `this.obj`
   * @api private
   */

  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
    var ok = util.test(this, arguments);
    if (true !== showDiff) showDiff = false;
    if (true !== config.showDiff) showDiff = false;

    if (!ok) {
      var msg = util.getMessage(this, arguments)
        , actual = util.getActual(this, arguments);
      throw new AssertionError(msg, {
          actual: actual
        , expected: expected
        , showDiff: showDiff
      }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));
    }
  };

  /*!
   * ### ._obj
   *
   * Quick reference to stored `actual` value for plugin developers.
   *
   * @api private
   */

  Object.defineProperty(Assertion.prototype, '_obj',
    { get: function () {
        return flag(this, 'object');
      }
    , set: function (val) {
        flag(this, 'object', val);
      }
  });
};

},{"./config":38}],38:[function(require,module,exports){
module.exports = {

  /**
   * ### config.includeStack
   *
   * User configurable property, influences whether stack trace
   * is included in Assertion error message. Default of false
   * suppresses stack trace in the error message.
   *
   *     chai.config.includeStack = true;  // enable stack on error
   *
   * @param {Boolean}
   * @api public
   */

   includeStack: false,

  /**
   * ### config.showDiff
   *
   * User configurable property, influences whether or not
   * the `showDiff` flag should be included in the thrown
   * AssertionErrors. `false` will always be `false`; `true`
   * will be true when the assertion has requested a diff
   * be shown.
   *
   * @param {Boolean}
   * @api public
   */

  showDiff: true,

  /**
   * ### config.truncateThreshold
   *
   * User configurable property, sets length threshold for actual and
   * expected values in assertion errors. If this threshold is exceeded,
   * the value is truncated.
   *
   * Set it to zero if you want to disable truncating altogether.
   *
   *     chai.config.truncateThreshold = 0;  // disable truncating
   *
   * @param {Number}
   * @api public
   */

  truncateThreshold: 40

};

},{}],39:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, _) {
  var Assertion = chai.Assertion
    , toString = Object.prototype.toString
    , flag = _.flag;

  /**
   * ### Language Chains
   *
   * The following are provided as chainable getters to
   * improve the readability of your assertions. They
   * do not provide testing capabilities unless they
   * have been overwritten by a plugin.
   *
   * **Chains**
   *
   * - to
   * - be
   * - been
   * - is
   * - that
   * - and
   * - has
   * - have
   * - with
   * - at
   * - of
   * - same
   *
   * @name language chains
   * @api public
   */

  [ 'to', 'be', 'been'
  , 'is', 'and', 'has', 'have'
  , 'with', 'that', 'at'
  , 'of', 'same' ].forEach(function (chain) {
    Assertion.addProperty(chain, function () {
      return this;
    });
  });

  /**
   * ### .not
   *
   * Negates any of assertions following in the chain.
   *
   *     expect(foo).to.not.equal('bar');
   *     expect(goodFn).to.not.throw(Error);
   *     expect({ foo: 'baz' }).to.have.property('foo')
   *       .and.not.equal('bar');
   *
   * @name not
   * @api public
   */

  Assertion.addProperty('not', function () {
    flag(this, 'negate', true);
  });

  /**
   * ### .deep
   *
   * Sets the `deep` flag, later used by the `equal` and
   * `property` assertions.
   *
   *     expect(foo).to.deep.equal({ bar: 'baz' });
   *     expect({ foo: { bar: { baz: 'quux' } } })
   *       .to.have.deep.property('foo.bar.baz', 'quux');
   *
   * @name deep
   * @api public
   */

  Assertion.addProperty('deep', function () {
    flag(this, 'deep', true);
  });

  /**
   * ### .a(type)
   *
   * The `a` and `an` assertions are aliases that can be
   * used either as language chains or to assert a value's
   * type.
   *
   *     // typeof
   *     expect('test').to.be.a('string');
   *     expect({ foo: 'bar' }).to.be.an('object');
   *     expect(null).to.be.a('null');
   *     expect(undefined).to.be.an('undefined');
   *
   *     // language chain
   *     expect(foo).to.be.an.instanceof(Foo);
   *
   * @name a
   * @alias an
   * @param {String} type
   * @param {String} message _optional_
   * @api public
   */

  function an (type, msg) {
    if (msg) flag(this, 'message', msg);
    type = type.toLowerCase();
    var obj = flag(this, 'object')
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';

    this.assert(
        type === _.type(obj)
      , 'expected #{this} to be ' + article + type
      , 'expected #{this} not to be ' + article + type
    );
  }

  Assertion.addChainableMethod('an', an);
  Assertion.addChainableMethod('a', an);

  /**
   * ### .include(value)
   *
   * The `include` and `contain` assertions can be used as either property
   * based language chains or as methods to assert the inclusion of an object
   * in an array or a substring in a string. When used as language chains,
   * they toggle the `contain` flag for the `keys` assertion.
   *
   *     expect([1,2,3]).to.include(2);
   *     expect('foobar').to.contain('foo');
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
   *
   * @name include
   * @alias contain
   * @param {Object|String|Number} obj
   * @param {String} message _optional_
   * @api public
   */

  function includeChainingBehavior () {
    flag(this, 'contains', true);
  }

  function include (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var expected = false;
    if (_.type(obj) === 'array' && _.type(val) === 'object') {
      for (var i in obj) {
        if (_.eql(obj[i], val)) {
          expected = true;
          break;
        }
      }
    } else if (_.type(val) === 'object') {
      if (!flag(this, 'negate')) {
        for (var k in val) new Assertion(obj).property(k, val[k]);
        return;
      }
      var subset = {}
      for (var k in val) subset[k] = obj[k]
      expected = _.eql(subset, val);
    } else {
      expected = obj && ~obj.indexOf(val)
    }
    this.assert(
        expected
      , 'expected #{this} to include ' + _.inspect(val)
      , 'expected #{this} to not include ' + _.inspect(val));
  }

  Assertion.addChainableMethod('include', include, includeChainingBehavior);
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);

  /**
   * ### .ok
   *
   * Asserts that the target is truthy.
   *
   *     expect('everthing').to.be.ok;
   *     expect(1).to.be.ok;
   *     expect(false).to.not.be.ok;
   *     expect(undefined).to.not.be.ok;
   *     expect(null).to.not.be.ok;
   *
   * Can also be used as a function, which prevents some linter errors.
   *
   *     expect('everthing').to.be.ok();
   *     
   * @name ok
   * @api public
   */

  Assertion.addChainableNoop('ok', function () {
    this.assert(
        flag(this, 'object')
      , 'expected #{this} to be truthy'
      , 'expected #{this} to be falsy');
  });

  /**
   * ### .true
   *
   * Asserts that the target is `true`.
   *
   *     expect(true).to.be.true;
   *     expect(1).to.not.be.true;
   *
   * Can also be used as a function, which prevents some linter errors.
   *
   *     expect(true).to.be.true();
   *
   * @name true
   * @api public
   */

  Assertion.addChainableNoop('true', function () {
    this.assert(
        true === flag(this, 'object')
      , 'expected #{this} to be true'
      , 'expected #{this} to be false'
      , this.negate ? false : true
    );
  });

  /**
   * ### .false
   *
   * Asserts that the target is `false`.
   *
   *     expect(false).to.be.false;
   *     expect(0).to.not.be.false;
   *
   * Can also be used as a function, which prevents some linter errors.
   *
   *     expect(false).to.be.false();
   *
   * @name false
   * @api public
   */

  Assertion.addChainableNoop('false', function () {
    this.assert(
        false === flag(this, 'object')
      , 'expected #{this} to be false'
      , 'expected #{this} to be true'
      , this.negate ? true : false
    );
  });

  /**
   * ### .null
   *
   * Asserts that the target is `null`.
   *
   *     expect(null).to.be.null;
   *     expect(undefined).not.to.be.null;
   *
   * Can also be used as a function, which prevents some linter errors.
   *
   *     expect(null).to.be.null();
   *
   * @name null
   * @api public
   */

  Assertion.addChainableNoop('null', function () {
    this.assert(
        null === flag(this, 'object')
      , 'expected #{this} to be null'
      , 'expected #{this} not to be null'
    );
  });

  /**
   * ### .undefined
   *
   * Asserts that the target is `undefined`.
   *
   *     expect(undefined).to.be.undefined;
   *     expect(null).to.not.be.undefined;
   *
   * Can also be used as a function, which prevents some linter errors.
   *
   *     expect(undefined).to.be.undefined();
   *
   * @name undefined
   * @api public
   */

  Assertion.addChainableNoop('undefined', function () {
    this.assert(
        undefined === flag(this, 'object')
      , 'expected #{this} to be undefined'
      , 'expected #{this} not to be undefined'
    );
  });

  /**
   * ### .exist
   *
   * Asserts that the target is neither `null` nor `undefined`.
   *
   *     var foo = 'hi'
   *       , bar = null
   *       , baz;
   *
   *     expect(foo).to.exist;
   *     expect(bar).to.not.exist;
   *     expect(baz).to.not.exist;
   *
   * Can also be used as a function, which prevents some linter errors.
   *
   *     expect(foo).to.exist();
   *
   * @name exist
   * @api public
   */

  Assertion.addChainableNoop('exist', function () {
    this.assert(
        null != flag(this, 'object')
      , 'expected #{this} to exist'
      , 'expected #{this} to not exist'
    );
  });


  /**
   * ### .empty
   *
   * Asserts that the target's length is `0`. For arrays, it checks
   * the `length` property. For objects, it gets the count of
   * enumerable keys.
   *
   *     expect([]).to.be.empty;
   *     expect('').to.be.empty;
   *     expect({}).to.be.empty;
   *
   * Can also be used as a function, which prevents some linter errors.
   *
   *     expect([]).to.be.empty();
   *
   * @name empty
   * @api public
   */

  Assertion.addChainableNoop('empty', function () {
    var obj = flag(this, 'object')
      , expected = obj;

    if (Array.isArray(obj) || 'string' === typeof object) {
      expected = obj.length;
    } else if (typeof obj === 'object') {
      expected = Object.keys(obj).length;
    }

    this.assert(
        !expected
      , 'expected #{this} to be empty'
      , 'expected #{this} not to be empty'
    );
  });

  /**
   * ### .arguments
   *
   * Asserts that the target is an arguments object.
   *
   *     function test () {
   *       expect(arguments).to.be.arguments;
   *     }
   *
   * Can also be used as a function, which prevents some linter errors.
   *
   *     function test () {
   *       expect(arguments).to.be.arguments();
   *     }
   *
   * @name arguments
   * @alias Arguments
   * @api public
   */

  function checkArguments () {
    var obj = flag(this, 'object')
      , type = Object.prototype.toString.call(obj);
    this.assert(
        '[object Arguments]' === type
      , 'expected #{this} to be arguments but got ' + type
      , 'expected #{this} to not be arguments'
    );
  }

  Assertion.addChainableNoop('arguments', checkArguments);
  Assertion.addChainableNoop('Arguments', checkArguments);

  /**
   * ### .equal(value)
   *
   * Asserts that the target is strictly equal (`===`) to `value`.
   * Alternately, if the `deep` flag is set, asserts that
   * the target is deeply equal to `value`.
   *
   *     expect('hello').to.equal('hello');
   *     expect(42).to.equal(42);
   *     expect(1).to.not.equal(true);
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
   *
   * @name equal
   * @alias equals
   * @alias eq
   * @alias deep.equal
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEqual (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'deep')) {
      return this.eql(val);
    } else {
      this.assert(
          val === obj
        , 'expected #{this} to equal #{exp}'
        , 'expected #{this} to not equal #{exp}'
        , val
        , this._obj
        , true
      );
    }
  }

  Assertion.addMethod('equal', assertEqual);
  Assertion.addMethod('equals', assertEqual);
  Assertion.addMethod('eq', assertEqual);

  /**
   * ### .eql(value)
   *
   * Asserts that the target is deeply equal to `value`.
   *
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
   *
   * @name eql
   * @alias eqls
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEql(obj, msg) {
    if (msg) flag(this, 'message', msg);
    this.assert(
        _.eql(obj, flag(this, 'object'))
      , 'expected #{this} to deeply equal #{exp}'
      , 'expected #{this} to not deeply equal #{exp}'
      , obj
      , this._obj
      , true
    );
  }

  Assertion.addMethod('eql', assertEql);
  Assertion.addMethod('eqls', assertEql);

  /**
   * ### .above(value)
   *
   * Asserts that the target is greater than `value`.
   *
   *     expect(10).to.be.above(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *
   * @name above
   * @alias gt
   * @alias greaterThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertAbove (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len > n
        , 'expected #{this} to have a length above #{exp} but got #{act}'
        , 'expected #{this} to not have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj > n
        , 'expected #{this} to be above ' + n
        , 'expected #{this} to be at most ' + n
      );
    }
  }

  Assertion.addMethod('above', assertAbove);
  Assertion.addMethod('gt', assertAbove);
  Assertion.addMethod('greaterThan', assertAbove);

  /**
   * ### .least(value)
   *
   * Asserts that the target is greater than or equal to `value`.
   *
   *     expect(10).to.be.at.least(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.least(2);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
   *
   * @name least
   * @alias gte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertLeast (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= n
        , 'expected #{this} to have a length at least #{exp} but got #{act}'
        , 'expected #{this} to have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj >= n
        , 'expected #{this} to be at least ' + n
        , 'expected #{this} to be below ' + n
      );
    }
  }

  Assertion.addMethod('least', assertLeast);
  Assertion.addMethod('gte', assertLeast);

  /**
   * ### .below(value)
   *
   * Asserts that the target is less than `value`.
   *
   *     expect(5).to.be.below(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *
   * @name below
   * @alias lt
   * @alias lessThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertBelow (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len < n
        , 'expected #{this} to have a length below #{exp} but got #{act}'
        , 'expected #{this} to not have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj < n
        , 'expected #{this} to be below ' + n
        , 'expected #{this} to be at least ' + n
      );
    }
  }

  Assertion.addMethod('below', assertBelow);
  Assertion.addMethod('lt', assertBelow);
  Assertion.addMethod('lessThan', assertBelow);

  /**
   * ### .most(value)
   *
   * Asserts that the target is less than or equal to `value`.
   *
   *     expect(5).to.be.at.most(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.most(4);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
   *
   * @name most
   * @alias lte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertMost (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len <= n
        , 'expected #{this} to have a length at most #{exp} but got #{act}'
        , 'expected #{this} to have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj <= n
        , 'expected #{this} to be at most ' + n
        , 'expected #{this} to be above ' + n
      );
    }
  }

  Assertion.addMethod('most', assertMost);
  Assertion.addMethod('lte', assertMost);

  /**
   * ### .within(start, finish)
   *
   * Asserts that the target is within a range.
   *
   *     expect(7).to.be.within(5,10);
   *
   * Can also be used in conjunction with `length` to
   * assert a length range. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name within
   * @param {Number} start lowerbound inclusive
   * @param {Number} finish upperbound inclusive
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('within', function (start, finish, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , range = start + '..' + finish;
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= start && len <= finish
        , 'expected #{this} to have a length within ' + range
        , 'expected #{this} to not have a length within ' + range
      );
    } else {
      this.assert(
          obj >= start && obj <= finish
        , 'expected #{this} to be within ' + range
        , 'expected #{this} to not be within ' + range
      );
    }
  });

  /**
   * ### .instanceof(constructor)
   *
   * Asserts that the target is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , Chai = new Tea('chai');
   *
   *     expect(Chai).to.be.an.instanceof(Tea);
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
   *
   * @name instanceof
   * @param {Constructor} constructor
   * @param {String} message _optional_
   * @alias instanceOf
   * @api public
   */

  function assertInstanceOf (constructor, msg) {
    if (msg) flag(this, 'message', msg);
    var name = _.getName(constructor);
    this.assert(
        flag(this, 'object') instanceof constructor
      , 'expected #{this} to be an instance of ' + name
      , 'expected #{this} to not be an instance of ' + name
    );
  };

  Assertion.addMethod('instanceof', assertInstanceOf);
  Assertion.addMethod('instanceOf', assertInstanceOf);

  /**
   * ### .property(name, [value])
   *
   * Asserts that the target has a property `name`, optionally asserting that
   * the value of that property is strictly equal to  `value`.
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep
   * references into objects and arrays.
   *
   *     // simple referencing
   *     var obj = { foo: 'bar' };
   *     expect(obj).to.have.property('foo');
   *     expect(obj).to.have.property('foo', 'bar');
   *
   *     // deep referencing
   *     var deepObj = {
   *         green: { tea: 'matcha' }
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
   *     };

   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
   *
   * You can also use an array as the starting point of a `deep.property`
   * assertion, or traverse nested arrays.
   *
   *     var arr = [
   *         [ 'chai', 'matcha', 'konacha' ]
   *       , [ { tea: 'chai' }
   *         , { tea: 'matcha' }
   *         , { tea: 'konacha' } ]
   *     ];
   *
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
   *
   * Furthermore, `property` changes the subject of the assertion
   * to be the value of that property from the original object. This
   * permits for further chainable assertions on that property.
   *
   *     expect(obj).to.have.property('foo')
   *       .that.is.a('string');
   *     expect(deepObj).to.have.property('green')
   *       .that.is.an('object')
   *       .that.deep.equals({ tea: 'matcha' });
   *     expect(deepObj).to.have.property('teas')
   *       .that.is.an('array')
   *       .with.deep.property('[2]')
   *         .that.deep.equals({ tea: 'konacha' });
   *
   * @name property
   * @alias deep.property
   * @param {String} name
   * @param {Mixed} value (optional)
   * @param {String} message _optional_
   * @returns value of property for chaining
   * @api public
   */

  Assertion.addMethod('property', function (name, val, msg) {
    if (msg) flag(this, 'message', msg);

    var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '
      , negate = flag(this, 'negate')
      , obj = flag(this, 'object')
      , value = flag(this, 'deep')
        ? _.getPathValue(name, obj)
        : obj[name];

    if (negate && undefined !== val) {
      if (undefined === value) {
        msg = (msg != null) ? msg + ': ' : '';
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
      }
    } else {
      this.assert(
          undefined !== value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
    }

    if (undefined !== val) {
      this.assert(
          val === value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
        , val
        , value
      );
    }

    flag(this, 'object', value);
  });


  /**
   * ### .ownProperty(name)
   *
   * Asserts that the target has an own property `name`.
   *
   *     expect('test').to.have.ownProperty('length');
   *
   * @name ownProperty
   * @alias haveOwnProperty
   * @param {String} name
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnProperty (name, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        obj.hasOwnProperty(name)
      , 'expected #{this} to have own property ' + _.inspect(name)
      , 'expected #{this} to not have own property ' + _.inspect(name)
    );
  }

  Assertion.addMethod('ownProperty', assertOwnProperty);
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);

  /**
   * ### .length(value)
   *
   * Asserts that the target's `length` property has
   * the expected value.
   *
   *     expect([ 1, 2, 3]).to.have.length(3);
   *     expect('foobar').to.have.length(6);
   *
   * Can also be used as a chain precursor to a value
   * comparison for the length property.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name length
   * @alias lengthOf
   * @param {Number} length
   * @param {String} message _optional_
   * @api public
   */

  function assertLengthChain () {
    flag(this, 'doLength', true);
  }

  function assertLength (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).to.have.property('length');
    var len = obj.length;

    this.assert(
        len == n
      , 'expected #{this} to have a length of #{exp} but got #{act}'
      , 'expected #{this} to not have a length of #{act}'
      , n
      , len
    );
  }

  Assertion.addChainableMethod('length', assertLength, assertLengthChain);
  Assertion.addMethod('lengthOf', assertLength);

  /**
   * ### .match(regexp)
   *
   * Asserts that the target matches a regular expression.
   *
   *     expect('foobar').to.match(/^foo/);
   *
   * @name match
   * @param {RegExp} RegularExpression
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('match', function (re, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        re.exec(obj)
      , 'expected #{this} to match ' + re
      , 'expected #{this} not to match ' + re
    );
  });

  /**
   * ### .string(string)
   *
   * Asserts that the string target contains another string.
   *
   *     expect('foobar').to.have.string('bar');
   *
   * @name string
   * @param {String} string
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('string', function (str, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('string');

    this.assert(
        ~obj.indexOf(str)
      , 'expected #{this} to contain ' + _.inspect(str)
      , 'expected #{this} to not contain ' + _.inspect(str)
    );
  });


  /**
   * ### .keys(key1, [key2], [...])
   *
   * Asserts that the target has exactly the given keys, or
   * asserts the inclusion of some keys when using the
   * `include` or `contain` modifiers.
   *
   *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');
   *
   * @name keys
   * @alias key
   * @param {String...|Array} keys
   * @api public
   */

  function assertKeys (keys) {
    var obj = flag(this, 'object')
      , str
      , ok = true;

    keys = keys instanceof Array
      ? keys
      : Array.prototype.slice.call(arguments);

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(obj)
      , expected = keys
      , len = keys.length;

    // Inclusion
    ok = keys.every(function(key){
      return ~actual.indexOf(key);
    });

    // Strict
    if (!flag(this, 'negate') && !flag(this, 'contains')) {
      ok = ok && keys.length == actual.length;
    }

    // Key string
    if (len > 1) {
      keys = keys.map(function(key){
        return _.inspect(key);
      });
      var last = keys.pop();
      str = keys.join(', ') + ', and ' + last;
    } else {
      str = _.inspect(keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

    // Assertion
    this.assert(
        ok
      , 'expected #{this} to ' + str
      , 'expected #{this} to not ' + str
      , expected.sort()
      , actual.sort()
      , true
    );
  }

  Assertion.addMethod('keys', assertKeys);
  Assertion.addMethod('key', assertKeys);

  /**
   * ### .throw(constructor)
   *
   * Asserts that the function target will throw a specific error, or specific type of error
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
   * for the error's message.
   *
   *     var err = new ReferenceError('This is a bad function.');
   *     var fn = function () { throw err; }
   *     expect(fn).to.throw(ReferenceError);
   *     expect(fn).to.throw(Error);
   *     expect(fn).to.throw(/bad function/);
   *     expect(fn).to.not.throw('good function');
   *     expect(fn).to.throw(ReferenceError, /bad function/);
   *     expect(fn).to.throw(err);
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));
   *
   * Please note that when a throw expectation is negated, it will check each
   * parameter independently, starting with error constructor type. The appropriate way
   * to check for the existence of a type of error but for a message that does not match
   * is to use `and`.
   *
   *     expect(fn).to.throw(ReferenceError)
   *        .and.not.throw(/good function/);
   *
   * @name throw
   * @alias throws
   * @alias Throw
   * @param {ErrorConstructor} constructor
   * @param {String|RegExp} expected error message
   * @param {String} message _optional_
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @returns error for chaining (null if no error)
   * @api public
   */

  function assertThrows (constructor, errMsg, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('function');

    var thrown = false
      , desiredError = null
      , name = null
      , thrownError = null;

    if (arguments.length === 0) {
      errMsg = null;
      constructor = null;
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
      errMsg = constructor;
      constructor = null;
    } else if (constructor && constructor instanceof Error) {
      desiredError = constructor;
      constructor = null;
      errMsg = null;
    } else if (typeof constructor === 'function') {
      name = constructor.prototype.name || constructor.name;
      if (name === 'Error' && constructor !== Error) {
        name = (new constructor()).name;
      }
    } else {
      constructor = null;
    }

    try {
      obj();
    } catch (err) {
      // first, check desired error
      if (desiredError) {
        this.assert(
            err === desiredError
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp}'
          , (desiredError instanceof Error ? desiredError.toString() : desiredError)
          , (err instanceof Error ? err.toString() : err)
        );

        flag(this, 'object', err);
        return this;
      }

      // next, check constructor
      if (constructor) {
        this.assert(
            err instanceof constructor
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'
          , name
          , (err instanceof Error ? err.toString() : err)
        );

        if (!errMsg) {
          flag(this, 'object', err);
          return this;
        }
      }

      // next, check message
      var message = 'object' === _.type(err) && "message" in err
        ? err.message
        : '' + err;

      if ((message != null) && errMsg && errMsg instanceof RegExp) {
        this.assert(
            errMsg.exec(message)
          , 'expected #{this} to throw error matching #{exp} but got #{act}'
          , 'expected #{this} to throw error not matching #{exp}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
        this.assert(
            ~message.indexOf(errMsg)
          , 'expected #{this} to throw error including #{exp} but got #{act}'
          , 'expected #{this} to throw error not including #{act}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else {
        thrown = true;
        thrownError = err;
      }
    }

    var actuallyGot = ''
      , expectedThrown = name !== null
        ? name
        : desiredError
          ? '#{exp}' //_.inspect(desiredError)
          : 'an error';

    if (thrown) {
      actuallyGot = ' but #{act} was thrown'
    }

    this.assert(
        thrown === true
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
      , (desiredError instanceof Error ? desiredError.toString() : desiredError)
      , (thrownError instanceof Error ? thrownError.toString() : thrownError)
    );

    flag(this, 'object', thrownError);
  };

  Assertion.addMethod('throw', assertThrows);
  Assertion.addMethod('throws', assertThrows);
  Assertion.addMethod('Throw', assertThrows);

  /**
   * ### .respondTo(method)
   *
   * Asserts that the object or class target will respond to a method.
   *
   *     Klass.prototype.bar = function(){};
   *     expect(Klass).to.respondTo('bar');
   *     expect(obj).to.respondTo('bar');
   *
   * To check if a constructor will respond to a static function,
   * set the `itself` flag.
   *
   *     Klass.baz = function(){};
   *     expect(Klass).itself.to.respondTo('baz');
   *
   * @name respondTo
   * @param {String} method
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('respondTo', function (method, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , itself = flag(this, 'itself')
      , context = ('function' === _.type(obj) && !itself)
        ? obj.prototype[method]
        : obj[method];

    this.assert(
        'function' === typeof context
      , 'expected #{this} to respond to ' + _.inspect(method)
      , 'expected #{this} to not respond to ' + _.inspect(method)
    );
  });

  /**
   * ### .itself
   *
   * Sets the `itself` flag, later used by the `respondTo` assertion.
   *
   *     function Foo() {}
   *     Foo.bar = function() {}
   *     Foo.prototype.baz = function() {}
   *
   *     expect(Foo).itself.to.respondTo('bar');
   *     expect(Foo).itself.not.to.respondTo('baz');
   *
   * @name itself
   * @api public
   */

  Assertion.addProperty('itself', function () {
    flag(this, 'itself', true);
  });

  /**
   * ### .satisfy(method)
   *
   * Asserts that the target passes a given truth test.
   *
   *     expect(1).to.satisfy(function(num) { return num > 0; });
   *
   * @name satisfy
   * @param {Function} matcher
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('satisfy', function (matcher, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var result = matcher(obj);
    this.assert(
        result
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
      , this.negate ? false : true
      , result
    );
  });

  /**
   * ### .closeTo(expected, delta)
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     expect(1.5).to.be.closeTo(1, 0.5);
   *
   * @name closeTo
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('closeTo', function (expected, delta, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj, msg).is.a('number');
    if (_.type(expected) !== 'number' || _.type(delta) !== 'number') {
      throw new Error('the arguments to closeTo must be numbers');
    }

    this.assert(
        Math.abs(obj - expected) <= delta
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
    );
  });

  function isSubsetOf(subset, superset, cmp) {
    return subset.every(function(elem) {
      if (!cmp) return superset.indexOf(elem) !== -1;

      return superset.some(function(elem2) {
        return cmp(elem, elem2);
      });
    })
  }

  /**
   * ### .members(set)
   *
   * Asserts that the target is a superset of `set`,
   * or that the target and `set` have the same strictly-equal (===) members.
   * Alternately, if the `deep` flag is set, set members are compared for deep
   * equality.
   *
   *     expect([1, 2, 3]).to.include.members([3, 2]);
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
   *
   *     expect([4, 2]).to.have.members([2, 4]);
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);
   *
   *     expect([{ id: 1 }]).to.deep.include.members([{ id: 1 }]);
   *
   * @name members
   * @param {Array} set
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('members', function (subset, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj).to.be.an('array');
    new Assertion(subset).to.be.an('array');

    var cmp = flag(this, 'deep') ? _.eql : undefined;

    if (flag(this, 'contains')) {
      return this.assert(
          isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to be a superset of #{act}'
        , 'expected #{this} to not be a superset of #{act}'
        , obj
        , subset
      );
    }

    this.assert(
        isSubsetOf(obj, subset, cmp) && isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to have the same members as #{act}'
        , 'expected #{this} to not have the same members as #{act}'
        , obj
        , subset
    );
  });
};

},{}],40:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


module.exports = function (chai, util) {

  /*!
   * Chai dependencies.
   */

  var Assertion = chai.Assertion
    , flag = util.flag;

  /*!
   * Module export.
   */

  /**
   * ### assert(expression, message)
   *
   * Write your own test expressions.
   *
   *     assert('foo' !== 'bar', 'foo is not bar');
   *     assert(Array.isArray([]), 'empty arrays are arrays');
   *
   * @param {Mixed} expression to test for truthiness
   * @param {String} message to display on error
   * @name assert
   * @api public
   */

  var assert = chai.assert = function (express, errmsg) {
    var test = new Assertion(null, null, chai.assert);
    test.assert(
        express
      , errmsg
      , '[ negation message unavailable ]'
    );
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure. Node.js `assert` module-compatible.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  assert.fail = function (actual, expected, message, operator) {
    message = message || 'assert.fail()';
    throw new chai.AssertionError(message, {
        actual: actual
      , expected: expected
      , operator: operator
    }, assert.fail);
  };

  /**
   * ### .ok(object, [message])
   *
   * Asserts that `object` is truthy.
   *
   *     assert.ok('everything', 'everything is ok');
   *     assert.ok(false, 'this will fail');
   *
   * @name ok
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.ok = function (val, msg) {
    new Assertion(val, msg).is.ok;
  };

  /**
   * ### .notOk(object, [message])
   *
   * Asserts that `object` is falsy.
   *
   *     assert.notOk('everything', 'this will fail');
   *     assert.notOk(false, 'this will pass');
   *
   * @name notOk
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.notOk = function (val, msg) {
    new Assertion(val, msg).is.not.ok;
  };

  /**
   * ### .equal(actual, expected, [message])
   *
   * Asserts non-strict equality (`==`) of `actual` and `expected`.
   *
   *     assert.equal(3, '3', '== coerces values to strings');
   *
   * @name equal
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.equal = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.equal);

    test.assert(
        exp == flag(test, 'object')
      , 'expected #{this} to equal #{exp}'
      , 'expected #{this} to not equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .notEqual(actual, expected, [message])
   *
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
   *
   *     assert.notEqual(3, 4, 'these numbers are not equal');
   *
   * @name notEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notEqual = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.notEqual);

    test.assert(
        exp != flag(test, 'object')
      , 'expected #{this} to not equal #{exp}'
      , 'expected #{this} to equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .strictEqual(actual, expected, [message])
   *
   * Asserts strict equality (`===`) of `actual` and `expected`.
   *
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');
   *
   * @name strictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.strictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.equal(exp);
  };

  /**
   * ### .notStrictEqual(actual, expected, [message])
   *
   * Asserts strict inequality (`!==`) of `actual` and `expected`.
   *
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
   *
   * @name notStrictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notStrictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.equal(exp);
  };

  /**
   * ### .deepEqual(actual, expected, [message])
   *
   * Asserts that `actual` is deeply equal to `expected`.
   *
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
   *
   * @name deepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.deepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.eql(exp);
  };

  /**
   * ### .notDeepEqual(actual, expected, [message])
   *
   * Assert that `actual` is not deeply equal to `expected`.
   *
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
   *
   * @name notDeepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notDeepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.eql(exp);
  };

  /**
   * ### .isTrue(value, [message])
   *
   * Asserts that `value` is true.
   *
   *     var teaServed = true;
   *     assert.isTrue(teaServed, 'the tea has been served');
   *
   * @name isTrue
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isTrue = function (val, msg) {
    new Assertion(val, msg).is['true'];
  };

  /**
   * ### .isFalse(value, [message])
   *
   * Asserts that `value` is false.
   *
   *     var teaServed = false;
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');
   *
   * @name isFalse
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFalse = function (val, msg) {
    new Assertion(val, msg).is['false'];
  };

  /**
   * ### .isNull(value, [message])
   *
   * Asserts that `value` is null.
   *
   *     assert.isNull(err, 'there was no error');
   *
   * @name isNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNull = function (val, msg) {
    new Assertion(val, msg).to.equal(null);
  };

  /**
   * ### .isNotNull(value, [message])
   *
   * Asserts that `value` is not null.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotNull(tea, 'great, time for tea!');
   *
   * @name isNotNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNull = function (val, msg) {
    new Assertion(val, msg).to.not.equal(null);
  };

  /**
   * ### .isUndefined(value, [message])
   *
   * Asserts that `value` is `undefined`.
   *
   *     var tea;
   *     assert.isUndefined(tea, 'no tea defined');
   *
   * @name isUndefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isUndefined = function (val, msg) {
    new Assertion(val, msg).to.equal(undefined);
  };

  /**
   * ### .isDefined(value, [message])
   *
   * Asserts that `value` is not `undefined`.
   *
   *     var tea = 'cup of chai';
   *     assert.isDefined(tea, 'tea has been defined');
   *
   * @name isDefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isDefined = function (val, msg) {
    new Assertion(val, msg).to.not.equal(undefined);
  };

  /**
   * ### .isFunction(value, [message])
   *
   * Asserts that `value` is a function.
   *
   *     function serveTea() { return 'cup of tea'; };
   *     assert.isFunction(serveTea, 'great, we can have tea now');
   *
   * @name isFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFunction = function (val, msg) {
    new Assertion(val, msg).to.be.a('function');
  };

  /**
   * ### .isNotFunction(value, [message])
   *
   * Asserts that `value` is _not_ a function.
   *
   *     var serveTea = [ 'heat', 'pour', 'sip' ];
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
   *
   * @name isNotFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotFunction = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('function');
  };

  /**
   * ### .isObject(value, [message])
   *
   * Asserts that `value` is an object (as revealed by
   * `Object.prototype.toString`).
   *
   *     var selection = { name: 'Chai', serve: 'with spices' };
   *     assert.isObject(selection, 'tea selection is an object');
   *
   * @name isObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isObject = function (val, msg) {
    new Assertion(val, msg).to.be.a('object');
  };

  /**
   * ### .isNotObject(value, [message])
   *
   * Asserts that `value` is _not_ an object.
   *
   *     var selection = 'chai'
   *     assert.isNotObject(selection, 'tea selection is not an object');
   *     assert.isNotObject(null, 'null is not an object');
   *
   * @name isNotObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotObject = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('object');
  };

  /**
   * ### .isArray(value, [message])
   *
   * Asserts that `value` is an array.
   *
   *     var menu = [ 'green', 'chai', 'oolong' ];
   *     assert.isArray(menu, 'what kind of tea do we want?');
   *
   * @name isArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isArray = function (val, msg) {
    new Assertion(val, msg).to.be.an('array');
  };

  /**
   * ### .isNotArray(value, [message])
   *
   * Asserts that `value` is _not_ an array.
   *
   *     var menu = 'green|chai|oolong';
   *     assert.isNotArray(menu, 'what kind of tea do we want?');
   *
   * @name isNotArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotArray = function (val, msg) {
    new Assertion(val, msg).to.not.be.an('array');
  };

  /**
   * ### .isString(value, [message])
   *
   * Asserts that `value` is a string.
   *
   *     var teaOrder = 'chai';
   *     assert.isString(teaOrder, 'order placed');
   *
   * @name isString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isString = function (val, msg) {
    new Assertion(val, msg).to.be.a('string');
  };

  /**
   * ### .isNotString(value, [message])
   *
   * Asserts that `value` is _not_ a string.
   *
   *     var teaOrder = 4;
   *     assert.isNotString(teaOrder, 'order placed');
   *
   * @name isNotString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotString = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('string');
  };

  /**
   * ### .isNumber(value, [message])
   *
   * Asserts that `value` is a number.
   *
   *     var cups = 2;
   *     assert.isNumber(cups, 'how many cups');
   *
   * @name isNumber
   * @param {Number} value
   * @param {String} message
   * @api public
   */

  assert.isNumber = function (val, msg) {
    new Assertion(val, msg).to.be.a('number');
  };

  /**
   * ### .isNotNumber(value, [message])
   *
   * Asserts that `value` is _not_ a number.
   *
   *     var cups = '2 cups please';
   *     assert.isNotNumber(cups, 'how many cups');
   *
   * @name isNotNumber
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNumber = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('number');
  };

  /**
   * ### .isBoolean(value, [message])
   *
   * Asserts that `value` is a boolean.
   *
   *     var teaReady = true
   *       , teaServed = false;
   *
   *     assert.isBoolean(teaReady, 'is the tea ready');
   *     assert.isBoolean(teaServed, 'has tea been served');
   *
   * @name isBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isBoolean = function (val, msg) {
    new Assertion(val, msg).to.be.a('boolean');
  };

  /**
   * ### .isNotBoolean(value, [message])
   *
   * Asserts that `value` is _not_ a boolean.
   *
   *     var teaReady = 'yep'
   *       , teaServed = 'nope';
   *
   *     assert.isNotBoolean(teaReady, 'is the tea ready');
   *     assert.isNotBoolean(teaServed, 'has tea been served');
   *
   * @name isNotBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotBoolean = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('boolean');
  };

  /**
   * ### .typeOf(value, name, [message])
   *
   * Asserts that `value`'s type is `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
   *     assert.typeOf('tea', 'string', 'we have a string');
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
   *     assert.typeOf(null, 'null', 'we have a null');
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
   *
   * @name typeOf
   * @param {Mixed} value
   * @param {String} name
   * @param {String} message
   * @api public
   */

  assert.typeOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.a(type);
  };

  /**
   * ### .notTypeOf(value, name, [message])
   *
   * Asserts that `value`'s type is _not_ `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
   *
   * @name notTypeOf
   * @param {Mixed} value
   * @param {String} typeof name
   * @param {String} message
   * @api public
   */

  assert.notTypeOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.a(type);
  };

  /**
   * ### .instanceOf(object, constructor, [message])
   *
   * Asserts that `value` is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new Tea('chai');
   *
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
   *
   * @name instanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.instanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.instanceOf(type);
  };

  /**
   * ### .notInstanceOf(object, constructor, [message])
   *
   * Asserts `value` is not an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new String('chai');
   *
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
   *
   * @name notInstanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.notInstanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.instanceOf(type);
  };

  /**
   * ### .include(haystack, needle, [message])
   *
   * Asserts that `haystack` includes `needle`. Works
   * for strings and arrays.
   *
   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
   *
   * @name include
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.include = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.include).include(inc);
  };

  /**
   * ### .notInclude(haystack, needle, [message])
   *
   * Asserts that `haystack` does not include `needle`. Works
   * for strings and arrays.
   *i
   *     assert.notInclude('foobar', 'baz', 'string not include substring');
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
   *
   * @name notInclude
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.notInclude = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.notInclude).not.include(inc);
  };

  /**
   * ### .match(value, regexp, [message])
   *
   * Asserts that `value` matches the regular expression `regexp`.
   *
   *     assert.match('foobar', /^foo/, 'regexp matches');
   *
   * @name match
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.match = function (exp, re, msg) {
    new Assertion(exp, msg).to.match(re);
  };

  /**
   * ### .notMatch(value, regexp, [message])
   *
   * Asserts that `value` does not match the regular expression `regexp`.
   *
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
   *
   * @name notMatch
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.notMatch = function (exp, re, msg) {
    new Assertion(exp, msg).to.not.match(re);
  };

  /**
   * ### .property(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`.
   *
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');
   *
   * @name property
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.property = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.property(prop);
  };

  /**
   * ### .notProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`.
   *
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
   *
   * @name notProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.property(prop);
  };

  /**
   * ### .deepProperty(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
   *
   * @name deepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.deepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop);
  };

  /**
   * ### .notDeepProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`, which
   * can be a string using dot- and bracket-notation for deep reference.
   *
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
   *
   * @name notDeepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notDeepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop);
  };

  /**
   * ### .propertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`.
   *
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
   *
   * @name propertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.property(prop, val);
  };

  /**
   * ### .propertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`.
   *
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
   *
   * @name propertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.property(prop, val);
  };

  /**
   * ### .deepPropertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`. `property` can use dot- and bracket-notation for deep
   * reference.
   *
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
   *
   * @name deepPropertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop, val);
  };

  /**
   * ### .deepPropertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`. `property` can use dot- and
   * bracket-notation for deep reference.
   *
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
   *
   * @name deepPropertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);
  };

  /**
   * ### .lengthOf(object, length, [message])
   *
   * Asserts that `object` has a `length` property with the expected value.
   *
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
   *     assert.lengthOf('foobar', 5, 'string has length of 6');
   *
   * @name lengthOf
   * @param {Mixed} object
   * @param {Number} length
   * @param {String} message
   * @api public
   */

  assert.lengthOf = function (exp, len, msg) {
    new Assertion(exp, msg).to.have.length(len);
  };

  /**
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
   *
   * Asserts that `function` will throw an error that is an instance of
   * `constructor`, or alternately that it will throw an error with message
   * matching `regexp`.
   *
   *     assert.throw(fn, 'function throws a reference error');
   *     assert.throw(fn, /function throws a reference error/);
   *     assert.throw(fn, ReferenceError);
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);
   *
   * @name throws
   * @alias throw
   * @alias Throw
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.Throw = function (fn, errt, errs, msg) {
    if ('string' === typeof errt || errt instanceof RegExp) {
      errs = errt;
      errt = null;
    }

    var assertErr = new Assertion(fn, msg).to.Throw(errt, errs);
    return flag(assertErr, 'object');
  };

  /**
   * ### .doesNotThrow(function, [constructor/regexp], [message])
   *
   * Asserts that `function` will _not_ throw an error that is an instance of
   * `constructor`, or alternately that it will not throw an error with message
   * matching `regexp`.
   *
   *     assert.doesNotThrow(fn, Error, 'function does not throw');
   *
   * @name doesNotThrow
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.doesNotThrow = function (fn, type, msg) {
    if ('string' === typeof type) {
      msg = type;
      type = null;
    }

    new Assertion(fn, msg).to.not.Throw(type);
  };

  /**
   * ### .operator(val1, operator, val2, [message])
   *
   * Compares two values using `operator`.
   *
   *     assert.operator(1, '<', 2, 'everything is ok');
   *     assert.operator(1, '>', 2, 'this will fail');
   *
   * @name operator
   * @param {Mixed} val1
   * @param {String} operator
   * @param {Mixed} val2
   * @param {String} message
   * @api public
   */

  assert.operator = function (val, operator, val2, msg) {
    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {
      throw new Error('Invalid operator "' + operator + '"');
    }
    var test = new Assertion(eval(val + operator + val2), msg);
    test.assert(
        true === flag(test, 'object')
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
  };

  /**
   * ### .closeTo(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
   *
   * @name closeTo
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @api public
   */

  assert.closeTo = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.closeTo(exp, delta);
  };

  /**
   * ### .sameMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members.
   * Order is not taken into account.
   *
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
   *
   * @name sameMembers
   * @param {Array} set1
   * @param {Array} set2
   * @param {String} message
   * @api public
   */

  assert.sameMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.members(set2);
  }

  /**
   * ### .includeMembers(superset, subset, [message])
   *
   * Asserts that `subset` is included in `superset`.
   * Order is not taken into account.
   *
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
   *
   * @name includeMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.includeMembers = function (superset, subset, msg) {
    new Assertion(superset, msg).to.include.members(subset);
  }

  /*!
   * Undocumented / untested
   */

  assert.ifError = function (val, msg) {
    new Assertion(val, msg).to.not.be.ok;
  };

  /*!
   * Aliases.
   */

  (function alias(name, as){
    assert[as] = assert[name];
    return alias;
  })
  ('Throw', 'throw')
  ('Throw', 'throws');
};

},{}],41:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  chai.expect = function (val, message) {
    return new chai.Assertion(val, message);
  };
};


},{}],42:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  var Assertion = chai.Assertion;

  function loadShould () {
    // explicitly define this method as function as to have it's name to include as `ssfi`
    function shouldGetter() {
      if (this instanceof String || this instanceof Number) {
        return new Assertion(this.constructor(this), null, shouldGetter);
      } else if (this instanceof Boolean) {
        return new Assertion(this == true, null, shouldGetter);
      }
      return new Assertion(this, null, shouldGetter);
    }
    function shouldSetter(value) {
      // See https://github.com/chaijs/chai/issues/86: this makes
      // `whatever.should = someValue` actually set `someValue`, which is
      // especially useful for `global.should = require('chai').should()`.
      //
      // Note that we have to use [[DefineProperty]] instead of [[Put]]
      // since otherwise we would trigger this very setter!
      Object.defineProperty(this, 'should', {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    // modify Object.prototype to have `should`
    Object.defineProperty(Object.prototype, 'should', {
      set: shouldSetter
      , get: shouldGetter
      , configurable: true
    });

    var should = {};

    should.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.equal(val2);
    };

    should.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.Throw(errt, errs);
    };

    should.exist = function (val, msg) {
      new Assertion(val, msg).to.exist;
    }

    // negation
    should.not = {}

    should.not.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.not.equal(val2);
    };

    should.not.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.not.Throw(errt, errs);
    };

    should.not.exist = function (val, msg) {
      new Assertion(val, msg).to.not.exist;
    }

    should['throw'] = should['Throw'];
    should.not['throw'] = should.not['Throw'];

    return should;
  };

  chai.should = loadShould;
  chai.Should = loadShould;
};

},{}],43:[function(require,module,exports){
/*!
 * Chai - addChainingMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var transferFlags = require('./transferFlags');
var flag = require('./flag');
var config = require('../config');

/*!
 * Module variables
 */

// Check whether `__proto__` is supported
var hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
var excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
var call  = Function.prototype.call,
    apply = Function.prototype.apply;

/**
 * ### addChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Adds a method to an object, such that the method can also be chained.
 *
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
 *
 * The result can then be used as both a method assertion, executing both `method` and
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
 *
 *     expect(fooStr).to.be.foo('bar');
 *     expect(fooStr).to.be.foo.equal('foo');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for `name`, when called
 * @param {Function} chainingBehavior function to be called every time the property is accessed
 * @name addChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== 'function') {
    chainingBehavior = function () { };
  }

  var chainableBehavior = {
      method: method
    , chainingBehavior: chainingBehavior
  };

  // save the methods so we can overwrite them later, if we need to.
  if (!ctx.__methods) {
    ctx.__methods = {};
  }
  ctx.__methods[name] = chainableBehavior;

  Object.defineProperty(ctx, name,
    { get: function () {
        chainableBehavior.chainingBehavior.call(this);

        var assert = function assert() {
          var old_ssfi = flag(this, 'ssfi');
          if (old_ssfi && config.includeStack === false)
            flag(this, 'ssfi', assert);
          var result = chainableBehavior.method.apply(this, arguments);
          return result === undefined ? this : result;
        };

        // Use `__proto__` if available
        if (hasProtoSupport) {
          // Inherit all properties from the object by replacing the `Function` prototype
          var prototype = assert.__proto__ = Object.create(this);
          // Restore the `call` and `apply` methods from `Function`
          prototype.call = call;
          prototype.apply = apply;
        }
        // Otherwise, redefine all properties (slow!)
        else {
          var asserterNames = Object.getOwnPropertyNames(ctx);
          asserterNames.forEach(function (asserterName) {
            if (!excludeNames.test(asserterName)) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
              Object.defineProperty(assert, asserterName, pd);
            }
          });
        }

        transferFlags(this, assert);
        return assert;
      }
    , configurable: true
  });
};

},{"../config":38,"./flag":46,"./transferFlags":60}],44:[function(require,module,exports){
/*!
 * Chai - addMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('../config');

/**
 * ### .addMethod (ctx, name, method)
 *
 * Adds a method to the prototype of an object.
 *
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(fooStr).to.be.foo('bar');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for name
 * @name addMethod
 * @api public
 */
var flag = require('./flag');

module.exports = function (ctx, name, method) {
  ctx[name] = function () {
    var old_ssfi = flag(this, 'ssfi');
    if (old_ssfi && config.includeStack === false)
      flag(this, 'ssfi', ctx[name]);
    var result = method.apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{"../config":38,"./flag":46}],45:[function(require,module,exports){
/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### addProperty (ctx, name, getter)
 *
 * Adds a property to the prototype of an object.
 *
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.instanceof(Foo);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.foo;
 *
 * @param {Object} ctx object to which the property is added
 * @param {String} name of property to add
 * @param {Function} getter function to be used for name
 * @name addProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter.call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],46:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### flag(object ,key, [value])
 *
 * Get or set a flag value on an object. If a
 * value is provided it will be set, else it will
 * return the currently set value or `undefined` if
 * the value is not set.
 *
 *     utils.flag(this, 'foo', 'bar'); // setter
 *     utils.flag(this, 'foo'); // getter, returns `bar`
 *
 * @param {Object} object (constructed Assertion
 * @param {String} key
 * @param {Mixed} value (optional)
 * @name flag
 * @api private
 */

module.exports = function (obj, key, value) {
  var flags = obj.__flags || (obj.__flags = Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
};

},{}],47:[function(require,module,exports){
/*!
 * Chai - getActual utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getActual(object, [actual])
 *
 * Returns the `actual` value for an Assertion
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  return args.length > 4 ? args[4] : obj._obj;
};

},{}],48:[function(require,module,exports){
/*!
 * Chai - getEnumerableProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getEnumerableProperties(object)
 *
 * This allows the retrieval of enumerable property names of an object,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getEnumerableProperties
 * @api public
 */

module.exports = function getEnumerableProperties(object) {
  var result = [];
  for (var name in object) {
    result.push(name);
  }
  return result;
};

},{}],49:[function(require,module,exports){
/*!
 * Chai - message composition utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag')
  , getActual = require('./getActual')
  , inspect = require('./inspect')
  , objDisplay = require('./objDisplay');

/**
 * ### .getMessage(object, message, negateMessage)
 *
 * Construct the error message based on flags
 * and template tags. Template tags will return
 * a stringified inspection of the object referenced.
 *
 * Message template tags:
 * - `#{this}` current asserted object
 * - `#{act}` actual value
 * - `#{exp}` expected value
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @name getMessage
 * @api public
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message');

  if(typeof msg === "function") msg = msg();
  msg = msg || '';
  msg = msg
    .replace(/#{this}/g, objDisplay(val))
    .replace(/#{act}/g, objDisplay(actual))
    .replace(/#{exp}/g, objDisplay(expected));

  return flagMsg ? flagMsg + ': ' + msg : msg;
};

},{"./flag":46,"./getActual":47,"./inspect":54,"./objDisplay":55}],50:[function(require,module,exports){
/*!
 * Chai - getName utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getName(func)
 *
 * Gets the name of a function, in a cross-browser way.
 *
 * @param {Function} a function (usually a constructor)
 */

module.exports = function (func) {
  if (func.name) return func.name;

  var match = /^\s?function ([^(]*)\(/.exec(func);
  return match && match[1] ? match[1] : "";
};

},{}],51:[function(require,module,exports){
/*!
 * Chai - getPathValue utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * @see https://github.com/logicalparadox/filtr
 * MIT Licensed
 */

/**
 * ### .getPathValue(path, object)
 *
 * This allows the retrieval of values in an
 * object given a string path.
 *
 *     var obj = {
 *         prop1: {
 *             arr: ['a', 'b', 'c']
 *           , str: 'Hello'
 *         }
 *       , prop2: {
 *             arr: [ { nested: 'Universe' } ]
 *           , str: 'Hello again!'
 *         }
 *     }
 *
 * The following would be the results.
 *
 *     getPathValue('prop1.str', obj); // Hello
 *     getPathValue('prop1.att[2]', obj); // b
 *     getPathValue('prop2.arr[0].nested', obj); // Universe
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} value or `undefined`
 * @name getPathValue
 * @api public
 */

var getPathValue = module.exports = function (path, obj) {
  var parsed = parsePath(path);
  return _getPathValue(parsed, obj);
};

/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `_getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 *
 * @param {String} path
 * @returns {Object} parsed
 * @api private
 */

function parsePath (path) {
  var str = path.replace(/\[/g, '.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map(function (value) {
    var re = /\[(\d+)\]$/
      , mArr = re.exec(value)
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value };
  });
};

/*!
 * ## _getPathValue(parsed, obj)
 *
 * Helper companion function for `.parsePath` that returns
 * the value located at the parsed address.
 *
 *      var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @returns {Object|Undefined} value
 * @api private
 */

function _getPathValue (parsed, obj) {
  var tmp = obj
    , res;
  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ('undefined' !== typeof part.p)
        tmp = tmp[part.p];
      else if ('undefined' !== typeof part.i)
        tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }
  return res;
};

},{}],52:[function(require,module,exports){
/*!
 * Chai - getProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getProperties(object)
 *
 * This allows the retrieval of property names of an object, enumerable or not,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getProperties
 * @api public
 */

module.exports = function getProperties(object) {
  var result = Object.getOwnPropertyNames(subject);

  function addProperty(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }

  var proto = Object.getPrototypeOf(subject);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty);
    proto = Object.getPrototypeOf(proto);
  }

  return result;
};

},{}],53:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main exports
 */

var exports = module.exports = {};

/*!
 * test utility
 */

exports.test = require('./test');

/*!
 * type utility
 */

exports.type = require('./type');

/*!
 * message utility
 */

exports.getMessage = require('./getMessage');

/*!
 * actual utility
 */

exports.getActual = require('./getActual');

/*!
 * Inspect util
 */

exports.inspect = require('./inspect');

/*!
 * Object Display util
 */

exports.objDisplay = require('./objDisplay');

/*!
 * Flag utility
 */

exports.flag = require('./flag');

/*!
 * Flag transferring utility
 */

exports.transferFlags = require('./transferFlags');

/*!
 * Deep equal utility
 */

exports.eql = require('deep-eql');

/*!
 * Deep path value
 */

exports.getPathValue = require('./getPathValue');

/*!
 * Function name
 */

exports.getName = require('./getName');

/*!
 * add Property
 */

exports.addProperty = require('./addProperty');

/*!
 * add Method
 */

exports.addMethod = require('./addMethod');

/*!
 * overwrite Property
 */

exports.overwriteProperty = require('./overwriteProperty');

/*!
 * overwrite Method
 */

exports.overwriteMethod = require('./overwriteMethod');

/*!
 * Add a chainable method
 */

exports.addChainableMethod = require('./addChainableMethod');

/*!
 * Overwrite chainable method
 */

exports.overwriteChainableMethod = require('./overwriteChainableMethod');


},{"./addChainableMethod":43,"./addMethod":44,"./addProperty":45,"./flag":46,"./getActual":47,"./getMessage":49,"./getName":50,"./getPathValue":51,"./inspect":54,"./objDisplay":55,"./overwriteChainableMethod":56,"./overwriteMethod":57,"./overwriteProperty":58,"./test":59,"./transferFlags":60,"./type":61,"deep-eql":63}],54:[function(require,module,exports){
// This is (almost) directly from Node.js utils
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

var getName = require('./getName');
var getProperties = require('./getProperties');
var getEnumerableProperties = require('./getEnumerableProperties');

module.exports = inspect;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 */
function inspect(obj, showHidden, depth, colors) {
  var ctx = {
    showHidden: showHidden,
    seen: [],
    stylize: function (str) { return str; }
  };
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
}

// Returns true if object is a DOM element.
var isDOMElement = function (object) {
  if (typeof HTMLElement === 'object') {
    return object instanceof HTMLElement;
  } else {
    return object &&
      typeof object === 'object' &&
      object.nodeType === 1 &&
      typeof object.nodeName === 'string';
  }
};

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (value && typeof value.inspect === 'function' &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (typeof ret !== 'string') {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // If this is a DOM element, try to get the outer HTML.
  if (isDOMElement(value)) {
    if ('outerHTML' in value) {
      return value.outerHTML;
      // This value does not have an outerHTML attribute,
      //   it could still be an XML element
    } else {
      // Attempt to serialize it
      try {
        if (document.xmlVersion) {
          var xmlSerializer = new XMLSerializer();
          return xmlSerializer.serializeToString(value);
        } else {
          // Firefox 11- do not support outerHTML
          //   It does, however, support innerHTML
          //   Use the following to render the element
          var ns = "http://www.w3.org/1999/xhtml";
          var container = document.createElementNS(ns, '_');

          container.appendChild(value.cloneNode(false));
          html = container.innerHTML
            .replace('><', '>' + value.innerHTML + '<');
          container.innerHTML = '';
          return html;
        }
      } catch (err) {
        // This could be a non-native DOM implementation,
        //   continue with the normal flow:
        //   printing the element as if it is an object.
      }
    }
  }

  // Look up the keys of the object.
  var visibleKeys = getEnumerableProperties(value);
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;

  // Some type of object without properties can be shortcutted.
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
  // a `stack` plus `description` property; ignore those for consistency.
  if (keys.length === 0 || (isError(value) && (
      (keys.length === 1 && keys[0] === 'stack') ||
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
     ))) {
    if (typeof value === 'function') {
      var name = getName(value);
      var nameSuffix = name ? ': ' + name : '';
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (typeof value === 'function') {
    var name = getName(value);
    var nameSuffix = name ? ': ' + name : '';
    base = ' [Function' + nameSuffix + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    return formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  switch (typeof value) {
    case 'undefined':
      return ctx.stylize('undefined', 'undefined');

    case 'string':
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');

    case 'number':
      if (value === 0 && (1/value) === -Infinity) {
        return ctx.stylize('-0', 'number');
      }
      return ctx.stylize('' + value, 'number');

    case 'boolean':
      return ctx.stylize('' + value, 'boolean');
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return ctx.stylize('null', 'null');
  }
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str;
  if (value.__lookupGetter__) {
    if (value.__lookupGetter__(key)) {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
  }
  if (visibleKeys.indexOf(key) < 0) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(value[key]) < 0) {
      if (recurseTimes === null) {
        str = formatValue(ctx, value[key], null);
      } else {
        str = formatValue(ctx, value[key], recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (typeof name === 'undefined') {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
}

function isRegExp(re) {
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
}

function isDate(d) {
  return typeof d === 'object' && objectToString(d) === '[object Date]';
}

function isError(e) {
  return typeof e === 'object' && objectToString(e) === '[object Error]';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

},{"./getEnumerableProperties":48,"./getName":50,"./getProperties":52}],55:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var inspect = require('./inspect');
var config = require('../config');

/**
 * ### .objDisplay (object)
 *
 * Determines if an object or an array matches
 * criteria to be inspected in-line for error
 * messages or should be truncated.
 *
 * @param {Mixed} javascript object to inspect
 * @name objDisplay
 * @api public
 */

module.exports = function (obj) {
  var str = inspect(obj)
    , type = Object.prototype.toString.call(obj);

  if (config.truncateThreshold && str.length >= config.truncateThreshold) {
    if (type === '[object Function]') {
      return !obj.name || obj.name === ''
        ? '[Function]'
        : '[Function: ' + obj.name + ']';
    } else if (type === '[object Array]') {
      return '[ Array(' + obj.length + ') ]';
    } else if (type === '[object Object]') {
      var keys = Object.keys(obj)
        , kstr = keys.length > 2
          ? keys.splice(0, 2).join(', ') + ', ...'
          : keys.join(', ');
      return '{ Object (' + kstr + ') }';
    } else {
      return str;
    }
  } else {
    return str;
  }
};

},{"../config":38,"./inspect":54}],56:[function(require,module,exports){
/*!
 * Chai - overwriteChainableMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteChainableMethod (ctx, name, fn)
 *
 * Overwites an already existing chainable method
 * and provides access to the previous function or
 * property.  Must return functions to be used for
 * name.
 *
 *     utils.overwriteChainableMethod(chai.Assertion.prototype, 'length',
 *       function (_super) {
 *       }
 *     , function (_super) {
 *       }
 *     );
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteChainableMethod('foo', fn, fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.have.length(3);
 *     expect(myFoo).to.have.length.above(3);
 *
 * @param {Object} ctx object whose method / property is to be overwritten
 * @param {String} name of method / property to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @param {Function} chainingBehavior function that returns a function to be used for property
 * @name overwriteChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  var chainableBehavior = ctx.__methods[name];

  var _chainingBehavior = chainableBehavior.chainingBehavior;
  chainableBehavior.chainingBehavior = function () {
    var result = chainingBehavior(_chainingBehavior).call(this);
    return result === undefined ? this : result;
  };

  var _method = chainableBehavior.method;
  chainableBehavior.method = function () {
    var result = method(_method).apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{}],57:[function(require,module,exports){
/*!
 * Chai - overwriteMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteMethod (ctx, name, fn)
 *
 * Overwites an already existing method and provides
 * access to previous function. Must return function
 * to be used for name.
 *
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
 *       return function (str) {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.value).to.equal(str);
 *         } else {
 *           _super.apply(this, arguments);
 *         }
 *       }
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.equal('bar');
 *
 * @param {Object} ctx object whose method is to be overwritten
 * @param {String} name of method to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @name overwriteMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  var _method = ctx[name]
    , _super = function () { return this; };

  if (_method && 'function' === typeof _method)
    _super = _method;

  ctx[name] = function () {
    var result = method(_super).apply(this, arguments);
    return result === undefined ? this : result;
  }
};

},{}],58:[function(require,module,exports){
/*!
 * Chai - overwriteProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteProperty (ctx, name, fn)
 *
 * Overwites an already existing property getter and provides
 * access to previous value. Must return function to use as getter.
 *
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
 *       return function () {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.name).to.equal('bar');
 *         } else {
 *           _super.call(this);
 *         }
 *       }
 *     });
 *
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.ok;
 *
 * @param {Object} ctx object whose property is to be overwritten
 * @param {String} name of property to overwrite
 * @param {Function} getter function that returns a getter function to be used for name
 * @name overwriteProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  var _get = Object.getOwnPropertyDescriptor(ctx, name)
    , _super = function () {};

  if (_get && 'function' === typeof _get.get)
    _super = _get.get

  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter(_super).call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],59:[function(require,module,exports){
/*!
 * Chai - test utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag');

/**
 * # test(object, expression)
 *
 * Test and object for expression.
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , expr = args[0];
  return negate ? !expr : expr;
};

},{"./flag":46}],60:[function(require,module,exports){
/*!
 * Chai - transferFlags utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### transferFlags(assertion, object, includeAll = true)
 *
 * Transfer all the flags for `assertion` to `object`. If
 * `includeAll` is set to `false`, then the base Chai
 * assertion flags (namely `object`, `ssfi`, and `message`)
 * will not be transferred.
 *
 *
 *     var newAssertion = new Assertion();
 *     utils.transferFlags(assertion, newAssertion);
 *
 *     var anotherAsseriton = new Assertion(myObj);
 *     utils.transferFlags(assertion, anotherAssertion, false);
 *
 * @param {Assertion} assertion the assertion to transfer the flags from
 * @param {Object} object the object to transfer the flags too; usually a new assertion
 * @param {Boolean} includeAll
 * @name getAllFlags
 * @api private
 */

module.exports = function (assertion, object, includeAll) {
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));

  if (!object.__flags) {
    object.__flags = Object.create(null);
  }

  includeAll = arguments.length === 3 ? includeAll : true;

  for (var flag in flags) {
    if (includeAll ||
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
      object.__flags[flag] = flags[flag];
    }
  }
};

},{}],61:[function(require,module,exports){
/*!
 * Chai - type utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Arguments]': 'arguments'
  , '[object Array]': 'array'
  , '[object Date]': 'date'
  , '[object Function]': 'function'
  , '[object Number]': 'number'
  , '[object RegExp]': 'regexp'
  , '[object String]': 'string'
};

/**
 * ### type(object)
 *
 * Better implementation of `typeof` detection that can
 * be used cross-browser. Handles the inconsistencies of
 * Array, `null`, and `undefined` detection.
 *
 *     utils.type({}) // 'object'
 *     utils.type(null) // `null'
 *     utils.type(undefined) // `undefined`
 *     utils.type([]) // `array`
 *
 * @param {Mixed} object to detect type of
 * @name type
 * @api private
 */

module.exports = function (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
};

},{}],62:[function(require,module,exports){
/*!
 * assertion-error
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Return a function that will copy properties from
 * one object to another excluding any originally
 * listed. Returned function will create a new `{}`.
 *
 * @param {String} excluded properties ...
 * @return {Function}
 */

function exclude () {
  var excludes = [].slice.call(arguments);

  function excludeProps (res, obj) {
    Object.keys(obj).forEach(function (key) {
      if (!~excludes.indexOf(key)) res[key] = obj[key];
    });
  }

  return function extendExclude () {
    var args = [].slice.call(arguments)
      , i = 0
      , res = {};

    for (; i < args.length; i++) {
      excludeProps(res, args[i]);
    }

    return res;
  };
};

/*!
 * Primary Exports
 */

module.exports = AssertionError;

/**
 * ### AssertionError
 *
 * An extension of the JavaScript `Error` constructor for
 * assertion and validation scenarios.
 *
 * @param {String} message
 * @param {Object} properties to include (optional)
 * @param {callee} start stack function (optional)
 */

function AssertionError (message, _props, ssf) {
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
    , props = extend(_props || {});

  // default values
  this.message = message || 'Unspecified AssertionError';
  this.showDiff = false;

  // copy from properties
  for (var key in props) {
    this[key] = props[key];
  }

  // capture stack trace
  ssf = ssf || arguments.callee;
  if (ssf && Error.captureStackTrace) {
    Error.captureStackTrace(this, ssf);
  }
}

/*!
 * Inherit from Error.prototype
 */

AssertionError.prototype = Object.create(Error.prototype);

/*!
 * Statically set name
 */

AssertionError.prototype.name = 'AssertionError';

/*!
 * Ensure correct constructor
 */

AssertionError.prototype.constructor = AssertionError;

/**
 * Allow errors to be converted to JSON for static transfer.
 *
 * @param {Boolean} include stack (default: `true`)
 * @return {Object} object that can be `JSON.stringify`
 */

AssertionError.prototype.toJSON = function (stack) {
  var extend = exclude('constructor', 'toJSON', 'stack')
    , props = extend({ name: this.name }, this);

  // include stack if exists and not turned off
  if (false !== stack && this.stack) {
    props.stack = this.stack;
  }

  return props;
};

},{}],63:[function(require,module,exports){
module.exports = require('./lib/eql');

},{"./lib/eql":64}],64:[function(require,module,exports){
/*!
 * deep-eql
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var type = require('type-detect');

/*!
 * Buffer.isBuffer browser shim
 */

var Buffer;
try { Buffer = require('buffer').Buffer; }
catch(ex) {
  Buffer = {};
  Buffer.isBuffer = function() { return false; }
}

/*!
 * Primary Export
 */

module.exports = deepEqual;

/**
 * Assert super-strict (egal) equality between
 * two objects of any type.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @param {Array} memoised (optional)
 * @return {Boolean} equal match
 */

function deepEqual(a, b, m) {
  if (sameValue(a, b)) {
    return true;
  } else if ('date' === type(a)) {
    return dateEqual(a, b);
  } else if ('regexp' === type(a)) {
    return regexpEqual(a, b);
  } else if (Buffer.isBuffer(a)) {
    return bufferEqual(a, b);
  } else if ('arguments' === type(a)) {
    return argumentsEqual(a, b, m);
  } else if (!typeEqual(a, b)) {
    return false;
  } else if (('object' !== type(a) && 'object' !== type(b))
  && ('array' !== type(a) && 'array' !== type(b))) {
    return sameValue(a, b);
  } else {
    return objectEqual(a, b, m);
  }
}

/*!
 * Strict (egal) equality test. Ensures that NaN always
 * equals NaN and `-0` does not equal `+0`.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} equal match
 */

function sameValue(a, b) {
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  return a !== a && b !== b;
}

/*!
 * Compare the types of two given objects and
 * return if they are equal. Note that an Array
 * has a type of `array` (not `object`) and arguments
 * have a type of `arguments` (not `array`/`object`).
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function typeEqual(a, b) {
  return type(a) === type(b);
}

/*!
 * Compare two Date objects by asserting that
 * the time values are equal using `saveValue`.
 *
 * @param {Date} a
 * @param {Date} b
 * @return {Boolean} result
 */

function dateEqual(a, b) {
  if ('date' !== type(b)) return false;
  return sameValue(a.getTime(), b.getTime());
}

/*!
 * Compare two regular expressions by converting them
 * to string and checking for `sameValue`.
 *
 * @param {RegExp} a
 * @param {RegExp} b
 * @return {Boolean} result
 */

function regexpEqual(a, b) {
  if ('regexp' !== type(b)) return false;
  return sameValue(a.toString(), b.toString());
}

/*!
 * Assert deep equality of two `arguments` objects.
 * Unfortunately, these must be sliced to arrays
 * prior to test to ensure no bad behavior.
 *
 * @param {Arguments} a
 * @param {Arguments} b
 * @param {Array} memoize (optional)
 * @return {Boolean} result
 */

function argumentsEqual(a, b, m) {
  if ('arguments' !== type(b)) return false;
  a = [].slice.call(a);
  b = [].slice.call(b);
  return deepEqual(a, b, m);
}

/*!
 * Get enumerable properties of a given object.
 *
 * @param {Object} a
 * @return {Array} property names
 */

function enumerable(a) {
  var res = [];
  for (var key in a) res.push(key);
  return res;
}

/*!
 * Simple equality for flat iterable objects
 * such as Arrays or Node.js buffers.
 *
 * @param {Iterable} a
 * @param {Iterable} b
 * @return {Boolean} result
 */

function iterableEqual(a, b) {
  if (a.length !==  b.length) return false;

  var i = 0;
  var match = true;

  for (; i < a.length; i++) {
    if (a[i] !== b[i]) {
      match = false;
      break;
    }
  }

  return match;
}

/*!
 * Extension to `iterableEqual` specifically
 * for Node.js Buffers.
 *
 * @param {Buffer} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function bufferEqual(a, b) {
  if (!Buffer.isBuffer(b)) return false;
  return iterableEqual(a, b);
}

/*!
 * Block for `objectEqual` ensuring non-existing
 * values don't get in.
 *
 * @param {Mixed} object
 * @return {Boolean} result
 */

function isValue(a) {
  return a !== null && a !== undefined;
}

/*!
 * Recursively check the equality of two objects.
 * Once basic sameness has been established it will
 * defer to `deepEqual` for each enumerable key
 * in the object.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function objectEqual(a, b, m) {
  if (!isValue(a) || !isValue(b)) {
    return false;
  }

  if (a.prototype !== b.prototype) {
    return false;
  }

  var i;
  if (m) {
    for (i = 0; i < m.length; i++) {
      if ((m[i][0] === a && m[i][1] === b)
      ||  (m[i][0] === b && m[i][1] === a)) {
        return true;
      }
    }
  } else {
    m = [];
  }

  try {
    var ka = enumerable(a);
    var kb = enumerable(b);
  } catch (ex) {
    return false;
  }

  ka.sort();
  kb.sort();

  if (!iterableEqual(ka, kb)) {
    return false;
  }

  m.push([ a, b ]);

  var key;
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], m)) {
      return false;
    }
  }

  return true;
}

},{"buffer":67,"type-detect":65}],65:[function(require,module,exports){
module.exports = require('./lib/type');

},{"./lib/type":66}],66:[function(require,module,exports){
/*!
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Exports
 */

var exports = module.exports = getType;

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Array]': 'array'
  , '[object RegExp]': 'regexp'
  , '[object Function]': 'function'
  , '[object Arguments]': 'arguments'
  , '[object Date]': 'date'
};

/**
 * ### typeOf (obj)
 *
 * Use several different techniques to determine
 * the type of object being tested.
 *
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */

function getType (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
}

exports.Library = Library;

/**
 * ### Library
 *
 * Create a repository for custom type detection.
 *
 * ```js
 * var lib = new type.Library;
 * ```
 *
 */

function Library () {
  this.tests = {};
}

/**
 * #### .of (obj)
 *
 * Expose replacement `typeof` detection to the library.
 *
 * ```js
 * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
 * ```
 *
 * @param {Mixed} object to test
 * @return {String} type
 */

Library.prototype.of = getType;

/**
 * #### .define (type, test)
 *
 * Add a test to for the `.test()` assertion.
 *
 * Can be defined as a regular expression:
 *
 * ```js
 * lib.define('int', /^[0-9]+$/);
 * ```
 *
 * ... or as a function:
 *
 * ```js
 * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
 * ```
 *
 * @param {String} type
 * @param {RegExp|Function} test
 * @api public
 */

Library.prototype.define = function (type, test) {
  if (arguments.length === 1) return this.tests[type];
  this.tests[type] = test;
  return this;
};

/**
 * #### .test (obj, test)
 *
 * Assert that an object is of type. Will first
 * check natives, and if that does not pass it will
 * use the user defined custom tests.
 *
 * ```js
 * assert(lib.test('1', 'int'));
 * assert(lib.test('yes', 'bln'));
 * ```
 *
 * @param {Mixed} object
 * @param {String} type
 * @return {Boolean} result
 * @api public
 */

Library.prototype.test = function (obj, type) {
  if (type === getType(obj)) return true;
  var test = this.tests[type];

  if (test && 'regexp' === getType(test)) {
    return test.test(obj);
  } else if (test && 'function' === getType(test)) {
    return test(obj);
  } else {
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
  }
};

},{}],67:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":68,"ieee754":69,"is-array":70}],68:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],69:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],70:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],71:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":72}],72:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],73:[function(require,module,exports){
(function (global){
//! moment.js
//! version : 2.8.4
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {
    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = '2.8.4',
        // the global-scope this is NOT the global object in Node.js
        globalScope = typeof global !== 'undefined' ? global : this,
        oldGlobalMoment,
        round = Math.round,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for locale config files
        locales = {},

        // extra moment internal properties (plugins register props here)
        momentProperties = [],

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenOffsetMs = /[\+\-]?\d+/, // 1234567890123
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-15', '30']
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // default relative time thresholds
        relativeTimeThresholds = {
            s: 45,  // seconds to minute
            m: 45,  // minutes to hour
            h: 22,  // hours to day
            d: 26,  // days to month
            M: 11   // months to year
        },

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.localeData().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.localeData().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.localeData().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.localeData().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.localeData().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            x    : function () {
                return this.valueOf();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        deprecations = {},

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error('Implement me');
        }
    }

    function hasOwnProp(a, b) {
        return hasOwnProperty.call(a, b);
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function printMsg(msg) {
        if (moment.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                printMsg(msg);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            printMsg(msg);
            deprecations[name] = true;
        }
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.localeData().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Locale() {
    }

    // Moment prototype object
    function Moment(config, skipOverflow) {
        if (skipOverflow !== false) {
            checkOverflow(config);
        }
        copyConfig(this, config);
        this._d = new Date(+config._d);
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = moment.localeData();

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = from._pf;
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = makeAs(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = moment.duration(val, period);
            addOrSubtractDurationFromMoment(this, dur, direction);
            return this;
        };
    }

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment._locale[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment._locale, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 24 ||
                    (m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 ||
                                           m._a[SECOND] !== 0 ||
                                           m._a[MILLISECOND] !== 0)) ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0 &&
                    m._pf.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && hasModule) {
            try {
                oldLocale = moment.locale();
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function makeAs(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (moment.isMoment(input) || isDate(input) ?
                    +input : +moment(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            moment.updateOffset(res, false);
            return res;
        } else {
            return moment(input).local();
        }
    }

    /************************************
        Locale
    ************************************/


    extend(Locale.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _ordinalParseLenient.
            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
        },

        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName, format, strict) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = moment.utc([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }
                if (!strict && !this._monthsParse[i]) {
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                    return i;
                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LTS : 'h:mm:ss A',
            LT : 'h:mm A',
            L : 'MM/DD/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM D, YYYY LT'
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom, now) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom, [now]) : output;
        },

        _relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },

        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },

        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace('%d', number);
        },
        _ordinal : '%d',
        _ordinalParse : /\d{1,2}/,

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'Q':
            return parseTokenOneDigit;
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) {
                return parseTokenOneDigit;
            }
            /* falls through */
        case 'SS':
            if (strict) {
                return parseTokenTwoDigits;
            }
            /* falls through */
        case 'SSS':
            if (strict) {
                return parseTokenThreeDigits;
            }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return config._locale._meridiemParse;
        case 'x':
            return parseTokenOffsetMs;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        case 'Do':
            return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
            return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || '';
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // QUARTER
        case 'Q':
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        case 'Do' :
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(
                            input.match(/\d{1,2}/)[0], 10));
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = config._locale.isPM(input);
            break;
        // HOUR
        case 'h' : // fall through to hh
        case 'hh' :
            config._pf.bigHour = true;
            /* falls through */
        case 'H' : // fall through to HH
        case 'HH' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX OFFSET (MILLISECONDS)
        case 'x':
            config._d = new Date(toInt(input));
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        // WEEKDAY - human
        case 'dd':
        case 'ddd':
        case 'dddd':
            a = config._locale.weekdaysParse(input);
            // if we didn't get a weekday name, mark the date as invalid
            if (a != null) {
                config._w = config._w || {};
                config._w['d'] = a;
            } else {
                config._pf.invalidWeekday = input;
            }
            break;
        // WEEK, WEEK DAY - numeric
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gggg':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = toInt(input);
            }
            break;
        case 'gg':
        case 'GG':
            config._w = config._w || {};
            config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual zone can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day || normalizedInput.date,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._pf.bigHour === true && config._a[HOUR] <= 12) {
            config._pf.bigHour = undefined;
        }
        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }
        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be 'T' or undefined
                    config._f = isoDates[i][0] + (match[6] || ' ');
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += 'Z';
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function makeDateFromInput(config) {
        var input = config._i, matched;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            dateFromConfig(config);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, locale) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = locale.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = moment.duration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            years = round(duration.as('y')),

            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days < relativeTimeThresholds.d && ['dd', days] ||
                months === 1 && ['M'] ||
                months < relativeTimeThresholds.M && ['MM', months] ||
                years === 1 && ['y'] || ['yy', years];

        args[2] = withoutSuffix;
        args[3] = +posNegDuration > 0;
        args[4] = locale;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f,
            res;

        config._locale = config._locale || moment.localeData(config._l);

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (moment.isMoment(input)) {
            return new Moment(input, true);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        res = new Moment(config);
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    moment = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = locale;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso,
            diffRes;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        } else if (typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function (threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return relativeTimeThresholds[threshold];
        }
        relativeTimeThresholds[threshold] = limit;
        return true;
    };

    moment.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        function (key, value) {
            return moment.locale(key, value);
        }
    );

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    moment.locale = function (key, values) {
        var data;
        if (key) {
            if (typeof(values) !== 'undefined') {
                data = moment.defineLocale(key, values);
            }
            else {
                data = moment.localeData(key);
            }

            if (data) {
                moment.duration._locale = moment._locale = data;
            }
        }

        return moment._locale._abbr;
    };

    moment.defineLocale = function (name, values) {
        if (values !== null) {
            values.abbr = name;
            if (!locales[name]) {
                locales[name] = new Locale();
            }
            locales[name].set(values);

            // backwards compat for now: also set the locale
            moment.locale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    };

    moment.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        function (key) {
            return moment.localeData(key);
        }
    );

    // returns locale data
    moment.localeData = function (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return moment._locale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                if ('function' === typeof Date.prototype.toISOString) {
                    // native implementation is ~50x faster, use it when we can
                    return this.toDate().toISOString();
                } else {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function (keepLocalTime) {
            return this.zone(0, keepLocalTime);
        },

        local : function (keepLocalTime) {
            if (this._isUTC) {
                this.zone(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.add(this._dateTzOffset(), 'm');
                }
            }
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.localeData().postformat(output);
        },

        add : createAdder(1, 'add'),

        subtract : createAdder(-1, 'subtract'),

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output, daysAdjust;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                daysAdjust = (this - moment(this).startOf('month')) -
                    (that - moment(that).startOf('month'));
                // same as above but with zones, to negate all dst
                daysAdjust -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4;
                output += daysAdjust / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.localeData().calendar(format, this, moment(now)));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf : function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond') {
                return this;
            }
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        },

        isAfter: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this > +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return inputMs < +this.clone().startOf(units);
            }
        },

        isBefore: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this < +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return +this.clone().endOf(units) < inputMs;
            }
        },

        isSame: function (input, units) {
            var inputMs;
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this === +input;
            } else {
                inputMs = +moment(input);
                return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
            }
        },

        min: deprecate(
                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
                 function (other) {
                     other = moment.apply(null, arguments);
                     return other < this ? this : other;
                 }
         ),

        max: deprecate(
                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
                function (other) {
                    other = moment.apply(null, arguments);
                    return other > this ? this : other;
                }
        ),

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[zone(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist int zone
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        zone : function (input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (input != null) {
                if (typeof input === 'string') {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = this._dateTzOffset();
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.subtract(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                                moment.duration(offset - input, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
            } else {
                return this._isUTC ? offset : this._dateTzOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? 'UTC' : '';
        },

        zoneName : function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        },

        parseZone : function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        week : function (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        locale : function (key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = moment.localeData(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        },

        lang : deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        ),

        localeData : function () {
            return this._locale;
        },

        _dateTzOffset : function () {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return Math.round(this._d.getTimezoneOffset() / 15) * 15;
        }
    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
                daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    function daysToYears (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        return days * 400 / 146097;
    }

    function yearsToDays (years) {
        // years * 365 + absRound(years / 4) -
        //     absRound(years / 100) + absRound(years / 400);
        return years * 146097 / 400;
    }

    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years = 0;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);

            // Accurately convert days to years, assume start from year 0.
            years = absRound(daysToYears(days));
            days -= absRound(yearsToDays(years));

            // 30 days to a month
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
            months += absRound(days / 30);
            days %= 30;

            // 12 months -> 1 year
            years += absRound(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;
        },

        abs : function () {
            this._milliseconds = Math.abs(this._milliseconds);
            this._days = Math.abs(this._days);
            this._months = Math.abs(this._months);

            this._data.milliseconds = Math.abs(this._data.milliseconds);
            this._data.seconds = Math.abs(this._data.seconds);
            this._data.minutes = Math.abs(this._data.minutes);
            this._data.hours = Math.abs(this._data.hours);
            this._data.months = Math.abs(this._data.months);
            this._data.years = Math.abs(this._data.years);

            return this;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var output = relativeTime(this, !withSuffix, this.localeData());

            if (withSuffix) {
                output = this.localeData().pastFuture(+this, output);
            }

            return this.localeData().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            var days, months;
            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + this._milliseconds / 864e5;
                months = this._months + daysToYears(days) * 12;
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(yearsToDays(this._months / 12));
                switch (units) {
                    case 'week': return days / 7 + this._milliseconds / 6048e5;
                    case 'day': return days + this._milliseconds / 864e5;
                    case 'hour': return days * 24 + this._milliseconds / 36e5;
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        },

        lang : moment.fn.lang,
        locale : moment.fn.locale,

        toIsoString : deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead ' +
            '(notice the capitals)',
            function () {
                return this.toISOString();
            }
        ),

        toISOString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        },

        localeData : function () {
            return this._locale;
        }
    });

    moment.duration.fn.toString = moment.duration.fn.toISOString;

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    for (i in unitMillisecondFactors) {
        if (hasOwnProp(unitMillisecondFactors, i)) {
            makeDurationGetter(i.toLowerCase());
        }
    }

    moment.duration.fn.asMilliseconds = function () {
        return this.as('ms');
    };
    moment.duration.fn.asSeconds = function () {
        return this.as('s');
    };
    moment.duration.fn.asMinutes = function () {
        return this.as('m');
    };
    moment.duration.fn.asHours = function () {
        return this.as('h');
    };
    moment.duration.fn.asDays = function () {
        return this.as('d');
    };
    moment.duration.fn.asWeeks = function () {
        return this.as('weeks');
    };
    moment.duration.fn.asMonths = function () {
        return this.as('M');
    };
    moment.duration.fn.asYears = function () {
        return this.as('y');
    };

    /************************************
        Default Locale
    ************************************/


    // Set default locale, other locale will inherit from English.
    moment.locale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LOCALES */

    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                    'Accessing Moment through the global scope is ' +
                    'deprecated, and will be removed in an upcoming ' +
                    'release.',
                    moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === 'function' && define.amd) {
        define('moment', function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],74:[function(require,module,exports){
(function (Buffer,__dirname){
var expect = require('chai').expect;
var assert = require('chai').assert;


var path = require('path');
var bb = require('blue-button');
var bbg = require('../../index');

describe('parse generate parse generate', function () {
    var generatedDir = null;

    before(function () {
        generatedDir = path.join(__dirname, "../fixtures/files/generated");
        expect(generatedDir).to.exist;
    });

    it('CCD_1 should still be same', function () {
        var data = Buffer("PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pjw/eG1sLXN0eWxlc2hlZXQgdHlwZT0idGV4dC94c2wiIGhyZWY9IkNEQS54c2wiPz4KIAo8IS0tIFRpdGxlOiBVU19SZWFsbV9IZWFkZXJfVGVtcGxhdGUgLS0+CjxDbGluaWNhbERvY3VtZW50IHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhtbG5zPSJ1cm46aGw3LW9yZzp2MyIKCXhtbG5zOmNkYT0idXJuOmhsNy1vcmc6djMiIHhtbG5zOnNkdGM9InVybjpobDctb3JnOnNkdGMiPgoJPCEtLSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBDREEgSGVhZGVyIAoJCSoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC0tPgoJPHJlYWxtQ29kZSBjb2RlPSJVUyIvPgoJPHR5cGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xLjMiIGV4dGVuc2lvbj0iUE9DRF9IRDAwMDA0MCIvPgoJPCEtLSBVUyBHZW5lcmFsIEhlYWRlciBUZW1wbGF0ZSAtLT4KCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjEuMSIvPgoJPCEtLSAqKiogTm90ZTogVGhlIG5leHQgdGVtcGxhdGVJZCwgY29kZSBhbmQgdGl0bGUgd2lsbCBkaWZmZXIgZGVwZW5kaW5nIAoJCW9uIHdoYXQgdHlwZSBvZiBkb2N1bWVudCBpcyBiZWluZyBzZW50LiAqKiogLS0+Cgk8IS0tIGNvbmZvcm1zIHRvIHRoZSBkb2N1bWVudCBzcGVjaWZpYyByZXF1aXJlbWVudHMgLS0+Cgk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi4xLjIiLz4KCTxpZCBleHRlbnNpb249IlRUOTg4IiByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ljk5OTk5LjEiLz4KCTxjb2RlIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIgY29kZVN5c3RlbU5hbWU9IkxPSU5DIiBjb2RlPSIzNDEzMy05IgoJCWRpc3BsYXlOYW1lPSJTdW1tYXJpemF0aW9uIG9mIEVwaXNvZGUgTm90ZSIvPgoJPHRpdGxlPkNvbW11bml0eSBIZWFsdGggYW5kIEhvc3BpdGFsczogSGVhbHRoIFN1bW1hcnk8L3RpdGxlPgoJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMTIwOTE1MDAwMC0wNDAwIi8+Cgk8Y29uZmlkZW50aWFsaXR5Q29kZSBjb2RlPSJOIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjI1Ii8+Cgk8bGFuZ3VhZ2VDb2RlIGNvZGU9ImVuLVVTIi8+Cgk8c2V0SWQgZXh0ZW5zaW9uPSJzVFQ5ODgiIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5LjUuOTk5OTkuMTkiLz4KCTx2ZXJzaW9uTnVtYmVyIHZhbHVlPSIxIi8+Cgk8cmVjb3JkVGFyZ2V0PgoJCTxwYXRpZW50Um9sZT4KCQkJPGlkIGV4dGVuc2lvbj0iOTk4OTkxIiByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ljk5OTk5LjIiLz4KCQkJPCEtLSBGYWtlIElEIHVzaW5nIEhMNyBleGFtcGxlIE9JRC4gLS0+CgkJCTxpZCBleHRlbnNpb249IjExMS0wMC0yMzMwIiByb290PSIyLjE2Ljg0MC4xLjExMzg4My40LjEiLz4KCQkJPCEtLSBGYWtlIFNvY2lhbCBTZWN1cml0eSBOdW1iZXIgdXNpbmcgdGhlIGFjdHVhbCBTU04gT0lELiAtLT4KCQkJPGFkZHIgdXNlPSJIUCI+CgkJCQk8IS0tIEhQIGlzICJwcmltYXJ5IGhvbWUiIGZyb20gY29kZVN5c3RlbSAyLjE2Ljg0MC4xLjExMzg4My41LjExMTkgLS0+CgkJCQk8c3RyZWV0QWRkcmVzc0xpbmU+MTM1NyBBbWJlciBEcml2ZTwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQk8Y2l0eT5CZWF2ZXJ0b248L2NpdHk+CgkJCQk8c3RhdGU+T1I8L3N0YXRlPgoJCQkJPHBvc3RhbENvZGU+OTc4Njc8L3Bvc3RhbENvZGU+CgkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJCTwhLS0gVVMgaXMgIlVuaXRlZCBTdGF0ZXMiIGZyb20gSVNPIDMxNjYtMSBDb3VudHJ5IENvZGVzOiAxLjAuMzE2Ni4xIC0tPgoJCQk8L2FkZHI+CgkJCTx0ZWxlY29tIHZhbHVlPSJ0ZWw6KDgxNikyNzYtNjkwOSIgdXNlPSJIUCIvPgoJCQk8IS0tIEhQIGlzICJwcmltYXJ5IGhvbWUiIGZyb20gSEw3IEFkZHJlc3NVc2UgMi4xNi44NDAuMS4xMTM4ODMuNS4xMTE5IC0tPgoJCQk8cGF0aWVudD4KCQkJCTxuYW1lIHVzZT0iTCI+CgkJCQkJPCEtLSBMIGlzICJMZWdhbCIgZnJvbSBITDcgRW50aXR5TmFtZVVzZSAyLjE2Ljg0MC4xLjExMzg4My41LjQ1IC0tPgoJCQkJCTxnaXZlbj5Jc2FiZWxsYTwvZ2l2ZW4+CgkJCQkJPGdpdmVuPklzYTwvZ2l2ZW4+CgkJCQkJPCEtLSBDTCBpcyAiQ2FsbCBtZSIgZnJvbSBITDcgRW50aXR5TmFtZVBhcnRRdWFsaWZpZXIgMi4xNi44NDAuMS4xMTM4ODMuNS40MyAtLT4KCQkJCQk8ZmFtaWx5PkpvbmVzPC9mYW1pbHk+CgkJCQk8L25hbWU+CgkJCQk8YWRtaW5pc3RyYXRpdmVHZW5kZXJDb2RlIGNvZGU9IkYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuMSIKCQkJCQlkaXNwbGF5TmFtZT0iRmVtYWxlIi8+CgkJCQk8YmlydGhUaW1lIHZhbHVlPSIxOTc1MDUwMSIvPgoJCQkJPG1hcml0YWxTdGF0dXNDb2RlIGNvZGU9Ik0iIGRpc3BsYXlOYW1lPSJNYXJyaWVkIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjIiCgkJCQkJY29kZVN5c3RlbU5hbWU9Ik1hcml0YWxTdGF0dXNDb2RlIi8+CgkJCQk8cmVsaWdpb3VzQWZmaWxpYXRpb25Db2RlIGNvZGU9IjEwMTMiCgkJCQkJZGlzcGxheU5hbWU9IkNocmlzdGlhbiAobm9uLUNhdGhvbGljLCBub24tc3BlY2lmaWMpIgoJCQkJCWNvZGVTeXN0ZW1OYW1lPSJITDcgUmVsaWdpb3VzIEFmZmlsaWF0aW9uIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjEwNzYiLz4KCQkJCTwhLS0gQ0RDIFJhY2UgYW5kIEV0aG5pY2l0eSBjb2RlIHNldCBjb250YWlucyB0aGUgbWluaW11bSByYWNlIGFuZCBldGhuaWNpdHkgY2F0ZWdvcmllcyBkZWZpbmVkIGJ5IE9NQiBTdGFuZGFyZHMgZm9yIFJhY2UgYW5kIEV0aG5pY2l0eSAtLT4KCQkJCTxyYWNlQ29kZSBjb2RlPSIyMTA2LTMiIGRpc3BsYXlOYW1lPSJXaGl0ZSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4yMzgiCgkJCQkJY29kZVN5c3RlbU5hbWU9IlJhY2UgJmFtcDsgRXRobmljaXR5IC0gQ0RDIi8+CgkJCQk8ZXRobmljR3JvdXBDb2RlIGNvZGU9IjIxODYtNSIgZGlzcGxheU5hbWU9Ik5vdCBIaXNwYW5pYyBvciBMYXRpbm8iCgkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4yMzgiIGNvZGVTeXN0ZW1OYW1lPSJSYWNlICZhbXA7IEV0aG5pY2l0eSAtIENEQyIvPgoJCQkJPGd1YXJkaWFuPgoJCQkJCTxjb2RlIGNvZGU9IlBSTiIgZGlzcGxheU5hbWU9IlBhcmVudCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS4xMTEiCgkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJITDcgUm9sZSBjb2RlIi8+CgkJCQkJPGFkZHIgdXNlPSJIUCI+CgkJCQkJCTwhLS0gSFAgaXMgInByaW1hcnkgaG9tZSIgZnJvbSBjb2RlU3lzdGVtIDIuMTYuODQwLjEuMTEzODgzLjUuMTExOSAtLT4KCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjEzNTcgQW1iZXIgRHJpdmU8L3N0cmVldEFkZHJlc3NMaW5lPgoJCQkJCQk8Y2l0eT5CZWF2ZXJ0b248L2NpdHk+CgkJCQkJCTxzdGF0ZT5PUjwvc3RhdGU+CgkJCQkJCTxwb3N0YWxDb2RlPjk3ODY3PC9wb3N0YWxDb2RlPgoJCQkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJCQkJPCEtLSBVUyBpcyAiVW5pdGVkIFN0YXRlcyIgZnJvbSBJU08gMzE2Ni0xIENvdW50cnkgQ29kZXM6IDEuMC4zMTY2LjEgLS0+CgkJCQkJPC9hZGRyPgoJCQkJCTx0ZWxlY29tIHZhbHVlPSJ0ZWw6KDgxNikyNzYtNjkwOSIgdXNlPSJIUCIvPgoJCQkJCTxndWFyZGlhblBlcnNvbj4KCQkJCQkJPG5hbWU+CgkJCQkJCQk8Z2l2ZW4+UmFscGg8L2dpdmVuPgoJCQkJCQkJPGZhbWlseT5Kb25lczwvZmFtaWx5PgoJCQkJCQk8L25hbWU+CgkJCQkJPC9ndWFyZGlhblBlcnNvbj4KCQkJCTwvZ3VhcmRpYW4+CgkJCQk8YmlydGhwbGFjZT4KCQkJCQk8cGxhY2U+CgkJCQkJCTxhZGRyPgoJCQkJCQkJPGNpdHk+QmVhdmVydG9uPC9jaXR5PgoJCQkJCQkJPHN0YXRlPk9SPC9zdGF0ZT4KCQkJCQkJCTxwb3N0YWxDb2RlPjk3ODY3PC9wb3N0YWxDb2RlPgoJCQkJCQkJPGNvdW50cnk+VVM8L2NvdW50cnk+CgkJCQkJCTwvYWRkcj4KCQkJCQk8L3BsYWNlPgoJCQkJPC9iaXJ0aHBsYWNlPgoJCQkJPGxhbmd1YWdlQ29tbXVuaWNhdGlvbj4KCQkJCQk8bGFuZ3VhZ2VDb2RlIGNvZGU9ImVuIi8+CgkJCQkJPCEtLSBFTiBpcyAiRW5nbGlzaCIgYXMgaW4gdGhlIElHIC0tPgoJCQkJCTxtb2RlQ29kZSBjb2RlPSJFU1AiIGRpc3BsYXlOYW1lPSJFeHByZXNzZWQgc3Bva2VuIgoJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjYwIiBjb2RlU3lzdGVtTmFtZT0iTGFuZ3VhZ2VBYmlsaXR5TW9kZSIvPgoJCQkJCTxwcm9maWNpZW5jeUxldmVsQ29kZSBjb2RlPSJHIiBkaXNwbGF5TmFtZT0iR29vZCIKCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS42MSIKCQkJCQkJY29kZVN5c3RlbU5hbWU9Ikxhbmd1YWdlQWJpbGl0eVByb2ZpY2llbmN5Ii8+CgkJCQkJPHByZWZlcmVuY2VJbmQgdmFsdWU9InRydWUiLz4KCQkJCTwvbGFuZ3VhZ2VDb21tdW5pY2F0aW9uPgoJCQk8L3BhdGllbnQ+CgkJCTxwcm92aWRlck9yZ2FuaXphdGlvbj4KCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My40LjYiLz4KCQkJCTxuYW1lPkNvbW11bml0eSBIZWFsdGggYW5kIEhvc3BpdGFsczwvbmFtZT4KCQkJCTx0ZWxlY29tIHVzZT0iV1AiIHZhbHVlPSJ0ZWw6IDU1NS01NTUtNTAwMCIvPgoJCQkJPGFkZHI+CgkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjEwMDEgVmlsbGFnZSBBdmVudWU8L3N0cmVldEFkZHJlc3NMaW5lPgoJCQkJCTxjaXR5PlBvcnRsYW5kPC9jaXR5PgoJCQkJCTxzdGF0ZT5PUjwvc3RhdGU+CgkJCQkJPHBvc3RhbENvZGU+OTkxMjM8L3Bvc3RhbENvZGU+CgkJCQkJPGNvdW50cnk+VVM8L2NvdW50cnk+CgkJCQk8L2FkZHI+CgkJCTwvcHJvdmlkZXJPcmdhbml6YXRpb24+CgkJPC9wYXRpZW50Um9sZT4KCTwvcmVjb3JkVGFyZ2V0PgoJPGF1dGhvcj4KCQk8dGltZSB2YWx1ZT0iMjAwNTAzMjkyMjQ0MTErMDUwMCIvPgoJCTxhc3NpZ25lZEF1dGhvcj4KCQkJPGlkIGV4dGVuc2lvbj0iOTk5OTk5OTkiIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjQuNiIvPgoJCQk8Y29kZSBjb2RlPSIyMDAwMDAwMDBYIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEwMSIKCQkJCWRpc3BsYXlOYW1lPSJBbGxvcGF0aGljICZhbXA7IE9zdGVvcGF0aGljIFBoeXNpY2lhbnMiLz4KCQkJPGFkZHI+CgkJCQk8c3RyZWV0QWRkcmVzc0xpbmU+MTAwMiBIZWFsdGhjYXJlIERyaXZlIDwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQk8Y2l0eT5Qb3J0bGFuZDwvY2l0eT4KCQkJCTxzdGF0ZT5PUjwvc3RhdGU+CgkJCQk8cG9zdGFsQ29kZT45OTEyMzwvcG9zdGFsQ29kZT4KCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQk8L2FkZHI+CgkJCTx0ZWxlY29tIHVzZT0iV1AiIHZhbHVlPSJ0ZWw6NTU1LTU1NS0xMDAyIi8+CgkJCTxhc3NpZ25lZFBlcnNvbj4KCQkJCTxuYW1lPgoJCQkJCTxnaXZlbj5IZW5yeTwvZ2l2ZW4+CgkJCQkJPGZhbWlseT5TZXZlbjwvZmFtaWx5PgoJCQkJPC9uYW1lPgoJCQk8L2Fzc2lnbmVkUGVyc29uPgoJCTwvYXNzaWduZWRBdXRob3I+Cgk8L2F1dGhvcj4KCTxkYXRhRW50ZXJlcj4KCQk8YXNzaWduZWRFbnRpdHk+CgkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My40LjYiIGV4dGVuc2lvbj0iOTk5OTk5OTQzMjUyIi8+CgkJCTxhZGRyPgoJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjEwMDEgVmlsbGFnZSBBdmVudWU8L3N0cmVldEFkZHJlc3NMaW5lPgoJCQkJPGNpdHk+UG9ydGxhbmQ8L2NpdHk+CgkJCQk8c3RhdGU+T1I8L3N0YXRlPgoJCQkJPHBvc3RhbENvZGU+OTkxMjM8L3Bvc3RhbENvZGU+CgkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJPC9hZGRyPgoJCQk8dGVsZWNvbSB1c2U9IldQIiB2YWx1ZT0idGVsOjU1NS01NTUtMTAwMiIvPgoJCQk8YXNzaWduZWRQZXJzb24+CgkJCQk8bmFtZT4KCQkJCQk8Z2l2ZW4+SGVucnk8L2dpdmVuPgoJCQkJCTxmYW1pbHk+U2V2ZW48L2ZhbWlseT4KCQkJCTwvbmFtZT4KCQkJPC9hc3NpZ25lZFBlcnNvbj4KCQk8L2Fzc2lnbmVkRW50aXR5PgoJPC9kYXRhRW50ZXJlcj4KCTxpbmZvcm1hbnQ+CgkJPGFzc2lnbmVkRW50aXR5PgoJCQk8aWQgZXh0ZW5zaW9uPSJLUDAwMDE3IiByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ii8+CgkJCTxhZGRyPgoJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjEwMDEgVmlsbGFnZSBBdmVudWU8L3N0cmVldEFkZHJlc3NMaW5lPgoJCQkJPGNpdHk+UG9ydGxhbmQ8L2NpdHk+CgkJCQk8c3RhdGU+T1I8L3N0YXRlPgoJCQkJPHBvc3RhbENvZGU+OTkxMjM8L3Bvc3RhbENvZGU+CgkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJPC9hZGRyPgoJCQk8dGVsZWNvbSB1c2U9IldQIiB2YWx1ZT0idGVsOjU1NS01NTUtMTAwMiIvPgoJCQk8YXNzaWduZWRQZXJzb24+CgkJCQk8bmFtZT4KCQkJCQk8Z2l2ZW4+SGVucnk8L2dpdmVuPgoJCQkJCTxmYW1pbHk+U2V2ZW48L2ZhbWlseT4KCQkJCTwvbmFtZT4KCQkJPC9hc3NpZ25lZFBlcnNvbj4KCQk8L2Fzc2lnbmVkRW50aXR5PgoJPC9pbmZvcm1hbnQ+Cgk8aW5mb3JtYW50PgoJCTxyZWxhdGVkRW50aXR5IGNsYXNzQ29kZT0iUFJTIj4KCQkJPCEtLSBjbGFzc0NvZGUgUFJTIHJlcHJlc2VudHMgYSBwZXJzb24gd2l0aCBwZXJzb25hbCByZWxhdGlvbnNoaXAgd2l0aCAKCQkJCXRoZSBwYXRpZW50LiAtLT4KCQkJPGNvZGUgY29kZT0iU1BTIiBkaXNwbGF5TmFtZT0iU1BPVVNFIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My4xLjExLjE5NTYzIgoJCQkJY29kZVN5c3RlbU5hbWU9IlBlcnNvbmFsIFJlbGF0aW9uc2hpcCBSb2xlIFR5cGUgVmFsdWUgU2V0Ii8+CgkJCTxyZWxhdGVkUGVyc29uPgoJCQkJPG5hbWU+CgkJCQkJPGdpdmVuPkZyYW5rPC9naXZlbj4KCQkJCQk8ZmFtaWx5PkpvbmVzPC9mYW1pbHk+CgkJCQk8L25hbWU+CgkJCTwvcmVsYXRlZFBlcnNvbj4KCQk8L3JlbGF0ZWRFbnRpdHk+Cgk8L2luZm9ybWFudD4KCTxjdXN0b2RpYW4+CgkJPGFzc2lnbmVkQ3VzdG9kaWFuPgoJCQk8cmVwcmVzZW50ZWRDdXN0b2RpYW5Pcmdhbml6YXRpb24+CgkJCQk8aWQgZXh0ZW5zaW9uPSI5OTk5OTk5OSIgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuNC42Ii8+CgkJCQk8bmFtZT5Db21tdW5pdHkgSGVhbHRoIGFuZCBIb3NwaXRhbHM8L25hbWU+CgkJCQk8dGVsZWNvbSB2YWx1ZT0idGVsOiA1NTUtNTU1LTEwMDIiIHVzZT0iV1AiLz4KCQkJCTxhZGRyIHVzZT0iV1AiPgoJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xMDAyIEhlYWx0aGNhcmUgRHJpdmUgPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQk8Y2l0eT5Qb3J0bGFuZDwvY2l0eT4KCQkJCQk8c3RhdGU+T1I8L3N0YXRlPgoJCQkJCTxwb3N0YWxDb2RlPjk5MTIzPC9wb3N0YWxDb2RlPgoJCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQkJPC9hZGRyPgoJCQk8L3JlcHJlc2VudGVkQ3VzdG9kaWFuT3JnYW5pemF0aW9uPgoJCTwvYXNzaWduZWRDdXN0b2RpYW4+Cgk8L2N1c3RvZGlhbj4KCTxpbmZvcm1hdGlvblJlY2lwaWVudD4KCQk8aW50ZW5kZWRSZWNpcGllbnQ+CgkJCTxpbmZvcm1hdGlvblJlY2lwaWVudD4KCQkJCTxuYW1lPgoJCQkJCTxnaXZlbj5IZW5yeTwvZ2l2ZW4+CgkJCQkJPGZhbWlseT5TZXZlbjwvZmFtaWx5PgoJCQkJPC9uYW1lPgoJCQk8L2luZm9ybWF0aW9uUmVjaXBpZW50PgoJCQk8cmVjZWl2ZWRPcmdhbml6YXRpb24+CgkJCQk8bmFtZT5Db21tdW5pdHkgSGVhbHRoIGFuZCBIb3NwaXRhbHM8L25hbWU+CgkJCTwvcmVjZWl2ZWRPcmdhbml6YXRpb24+CgkJPC9pbnRlbmRlZFJlY2lwaWVudD4KCTwvaW5mb3JtYXRpb25SZWNpcGllbnQ+Cgk8bGVnYWxBdXRoZW50aWNhdG9yPgoJCTx0aW1lIHZhbHVlPSIyMDA5MDIyNzEzMDAwMCswNTAwIi8+CgkJPHNpZ25hdHVyZUNvZGUgY29kZT0iUyIvPgoJCTxhc3NpZ25lZEVudGl0eT4KCQkJPGlkIGV4dGVuc2lvbj0iOTk5OTk5OTk5IiByb290PSIyLjE2Ljg0MC4xLjExMzg4My40LjYiLz4KCQkJPGFkZHI+CgkJCQk8c3RyZWV0QWRkcmVzc0xpbmU+MTAwMSBWaWxsYWdlIEF2ZW51ZTwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQk8Y2l0eT5Qb3J0bGFuZDwvY2l0eT4KCQkJCTxzdGF0ZT5PUjwvc3RhdGU+CgkJCQk8cG9zdGFsQ29kZT45OTEyMzwvcG9zdGFsQ29kZT4KCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQk8L2FkZHI+CgkJCTx0ZWxlY29tIHVzZT0iV1AiIHZhbHVlPSJ0ZWw6NTU1LTU1NS0xMDAyIi8+CgkJCTxhc3NpZ25lZFBlcnNvbj4KCQkJCTxuYW1lPgoJCQkJCTxnaXZlbj5IZW5yeTwvZ2l2ZW4+CgkJCQkJPGZhbWlseT5TZXZlbjwvZmFtaWx5PgoJCQkJPC9uYW1lPgoJCQk8L2Fzc2lnbmVkUGVyc29uPgoJCTwvYXNzaWduZWRFbnRpdHk+Cgk8L2xlZ2FsQXV0aGVudGljYXRvcj4KCTxhdXRoZW50aWNhdG9yPgoJCTx0aW1lIHZhbHVlPSIyMDA5MDIyNzEzMDAwMCswNTAwIi8+CgkJPHNpZ25hdHVyZUNvZGUgY29kZT0iUyIvPgoJCTxhc3NpZ25lZEVudGl0eT4KCQkJPGlkIGV4dGVuc2lvbj0iOTk5OTk5OTk5IiByb290PSIyLjE2Ljg0MC4xLjExMzg4My40LjYiLz4KCQkJPGFkZHI+CgkJCQk8c3RyZWV0QWRkcmVzc0xpbmU+MTAwMSBWaWxsYWdlIEF2ZW51ZTwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQk8Y2l0eT5Qb3J0bGFuZDwvY2l0eT4KCQkJCTxzdGF0ZT5PUjwvc3RhdGU+CgkJCQk8cG9zdGFsQ29kZT45OTEyMzwvcG9zdGFsQ29kZT4KCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQk8L2FkZHI+CgkJCTx0ZWxlY29tIHVzZT0iV1AiIHZhbHVlPSJ0ZWw6NTU1LTU1NS0xMDAyIi8+CgkJCTxhc3NpZ25lZFBlcnNvbj4KCQkJCTxuYW1lPgoJCQkJCTxnaXZlbj5IZW5yeTwvZ2l2ZW4+CgkJCQkJPGZhbWlseT5TZXZlbjwvZmFtaWx5PgoJCQkJPC9uYW1lPgoJCQk8L2Fzc2lnbmVkUGVyc29uPgoJCTwvYXNzaWduZWRFbnRpdHk+Cgk8L2F1dGhlbnRpY2F0b3I+Cgk8ZG9jdW1lbnRhdGlvbk9mPgoJCTxzZXJ2aWNlRXZlbnQgY2xhc3NDb2RlPSJQQ1BSIj4KCQkJPGNvZGUgY29kZT0iNzM3NjEwMDEiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiCgkJCQlkaXNwbGF5TmFtZT0iQ29sb25vc2NvcHkiLz4KCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQk8bG93IHZhbHVlPSIyMDEyMDkwODAwMDAtMDQwMCIvPgoJCQkJPGhpZ2ggdmFsdWU9IjIwMTIwOTE1MDAwMC0wNDAwIi8+CgkJCTwvZWZmZWN0aXZlVGltZT4KCQkJPHBlcmZvcm1lciB0eXBlQ29kZT0iUFJGIj4KCQkJCTxmdW5jdGlvbkNvZGUgY29kZT0iUFAiIGRpc3BsYXlOYW1lPSJQcmltYXJ5IFBlcmZvcm1lciIKCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My4xMi40NDMiIGNvZGVTeXN0ZW1OYW1lPSJQcm92aWRlciBSb2xlIj4KCQkJCQk8b3JpZ2luYWxUZXh0PlByaW1hcnkgQ2FyZSBQcm92aWRlcjwvb3JpZ2luYWxUZXh0PgoJCQkJPC9mdW5jdGlvbkNvZGU+CgkJCQk8YXNzaWduZWRFbnRpdHk+CgkJCQkJPCEtLSBQcm92aWRlciBOUEkgIlBzZXVkb01ELTEiIC0tPgoJCQkJCTxpZCBleHRlbnNpb249IlBzZXVkb01ELTEiIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjQuNiIvPgoJCQkJCTxjb2RlIGNvZGU9IjIwN1JHMDEwMFgiIGRpc3BsYXlOYW1lPSJHYXN0cm9lbnRlcm9sb2dpc3QiCgkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJQcm92aWRlciBDb2RlcyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xMDEiLz4KCQkJCQk8YWRkcj4KCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjEwMDEgVmlsbGFnZSBBdmVudWU8L3N0cmVldEFkZHJlc3NMaW5lPgoJCQkJCQk8Y2l0eT5Qb3J0bGFuZDwvY2l0eT4KCQkJCQkJPHN0YXRlPk9SPC9zdGF0ZT4KCQkJCQkJPHBvc3RhbENvZGU+OTkxMjM8L3Bvc3RhbENvZGU+CgkJCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQkJCTwvYWRkcj4KCQkJCQk8dGVsZWNvbSB2YWx1ZT0idGVsOisxLTU1NS01NTUtNTAwMCIgdXNlPSJIUCIvPgoJCQkJCTxhc3NpZ25lZFBlcnNvbj4KCQkJCQkJPG5hbWU+CgkJCQkJCQk8cHJlZml4PkRyLjwvcHJlZml4PgoJCQkJCQkJPGdpdmVuPkhlbnJ5PC9naXZlbj4KCQkJCQkJCTxmYW1pbHk+U2V2ZW48L2ZhbWlseT4KCQkJCQkJPC9uYW1lPgoJCQkJCTwvYXNzaWduZWRQZXJzb24+CgkJCQkJPHJlcHJlc2VudGVkT3JnYW5pemF0aW9uPgoJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNS45OTk5LjEzOTMiLz4KCQkJCQkJPG5hbWU+Q29tbXVuaXR5IEhlYWx0aCBhbmQgSG9zcGl0YWxzPC9uYW1lPgoJCQkJCQk8dGVsZWNvbSB2YWx1ZT0idGVsOisxLTU1NS01NTUtNTAwMCIgdXNlPSJIUCIvPgoJCQkJCQk8YWRkcj4KCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xMDAxIFZpbGxhZ2UgQXZlbnVlPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCTxjaXR5PlBvcnRsYW5kPC9jaXR5PgoJCQkJCQkJPHN0YXRlPk9SPC9zdGF0ZT4KCQkJCQkJCTxwb3N0YWxDb2RlPjk5MTIzPC9wb3N0YWxDb2RlPgoJCQkJCQkJPGNvdW50cnk+VVM8L2NvdW50cnk+CgkJCQkJCTwvYWRkcj4KCQkJCQk8L3JlcHJlc2VudGVkT3JnYW5pemF0aW9uPgoJCQkJPC9hc3NpZ25lZEVudGl0eT4KCQkJPC9wZXJmb3JtZXI+CgkJPC9zZXJ2aWNlRXZlbnQ+Cgk8L2RvY3VtZW50YXRpb25PZj4KCTwhLS0gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogQ0RBIEJvZHkgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogLS0+Cgk8Y29tcG9uZW50PgoJCTxzdHJ1Y3R1cmVkQm9keT4KCQkJPCEtLSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogQURWQU5DRSBESVJFQ1RJVkVTKioqKioqKioqKioqKioqKioqKioqKioqKiogLS0+CgkJCTxjb21wb25lbnQ+CgkJCQk8c2VjdGlvbj4KCQkJCQk8IS0tIGNvbmZvcm1zIHRvIEFkdmFuY2UgRGlyZWN0aXZlcyBzZWN0aW9uIHdpdGggZW50cmllcyBvcHRpb25hbCAtLT4KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi4yLjIxIi8+CgkJCQkJPCEtLSBBZHZhbmNlIERpcmVjdGl2ZXMgc2VjdGlvbiB3aXRoIGVudHJpZXMgcmVxdWlyZWQgLS0+CgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuMi4yMS4xIi8+CgkJCQkJPGNvZGUgY29kZT0iNDIzNDgtMyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+CgkJCQkJPHRpdGxlPkFEVkFOQ0UgRElSRUNUSVZFUzwvdGl0bGU+CgkJCQkJPHRleHQ+CgkJCQkJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4KCQkJCQkJCTx0aGVhZD4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aD5EaXJlY3RpdmU8L3RoPgoJCQkJCQkJCQk8dGg+RGVzY3JpcHRpb248L3RoPgoJCQkJCQkJCQk8dGg+VmVyaWZpY2F0aW9uPC90aD4KCQkJCQkJCQkJPHRoPlN1cHBvcnRpbmcgRG9jdW1lbnQocyk8L3RoPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQk8L3RoZWFkPgoJCQkJCQkJPHRib2R5PgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPlJlc3VzY2l0YXRpb24gc3RhdHVzPC90ZD4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9IkFEMSI+RG8gbm90IHJlc3VzY2l0YXRlPC9jb250ZW50PgoJCQkJCQkJCQk8L3RkPgoJCQkJCQkJCQk8dGQ+RHIuIFJvYmVydCBEb2xpbiwgRmViIDEzLCAyMDExPC90ZD4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGxpbmtIdG1sCgkJCQkJCQkJCQkJaHJlZj0iQWR2YW5jZURpcmVjdGl2ZS5iNTBiNzkxMC03ZmZiLTRmNGMtYmJlNC0xNzdlZDY4Y2JiZjMucGRmIgoJCQkJCQkJCQkJCT5BZHZhbmNlIGRpcmVjdGl2ZTwvbGlua0h0bWw+CgkJCQkJCQkJCTwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGJvZHk+CgkJCQkJCTwvdGFibGU+CgkJCQkJPC90ZXh0PgoJCQkJCTxlbnRyeT4KCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNDgiLz4KCQkJCQkJCTwhLS0gKiogQWR2YW5jZSBEaXJlY3RpdmUgT2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQk8aWQgcm9vdD0iOWI1NGMzYzktMTY3My00OWM3LWFlZjktYjAzN2VkNzJlZDI3Ii8+CgkJCQkJCQk8Y29kZSBjb2RlPSIzMDQyNTEwMDgiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJZGlzcGxheU5hbWU9IlJlc3VzY2l0YXRpb24iLz4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAxMTAyMTMiLz4KCQkJCQkJCQk8aGlnaCBudWxsRmxhdm9yPSJOQSIvPgoJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iMzA0MjUzMDA2IgoJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJEbyBub3QgcmVzdXNjaXRhdGUiPgoJCQkJCQkJCTxvcmlnaW5hbFRleHQ+CgkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNBRDEiLz4KCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCTwvdmFsdWU+CgkJCQkJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IlZSRiI+CgkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS41OCIvPgoJCQkJCQkJCTx0aW1lIHZhbHVlPSIyMDExMDIwMTMiLz4KCQkJCQkJCQk8cGFydGljaXBhbnRSb2xlPgoJCQkJCQkJCQk8aWQgcm9vdD0iMjBjZjE0ZmItYjY1Yy00YzhjLWE1NGQtYjBjY2E4MzRjMThjIi8+CgkJCQkJCQkJCTxwbGF5aW5nRW50aXR5PgoJCQkJCQkJCQkJPG5hbWU+CgkJCQkJCQkJCQkJPHByZWZpeD5Eci48L3ByZWZpeD4KCQkJCQkJCQkJCQk8ZmFtaWx5PkRvbGluPC9mYW1pbHk+CgkJCQkJCQkJCQkJPGdpdmVuPlJvYmVydDwvZ2l2ZW4+CgkJCQkJCQkJCQk8L25hbWU+CgkJCQkJCQkJCTwvcGxheWluZ0VudGl0eT4KCQkJCQkJCQk8L3BhcnRpY2lwYW50Um9sZT4KCQkJCQkJCTwvcGFydGljaXBhbnQ+CgkJCQkJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IkNTVCI+CgkJCQkJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9IkFHTlQiPgoJCQkJCQkJCQk8YWRkcj4KCQkJCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4yMSBOb3J0aCBBdmUuPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCTxjaXR5PkJ1cmxpbmd0b248L2NpdHk+CgkJCQkJCQkJCQk8c3RhdGU+TUE8L3N0YXRlPgoJCQkJCQkJCQkJPHBvc3RhbENvZGU+MDIzNjg8L3Bvc3RhbENvZGU+CgkJCQkJCQkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJCQkJCQkJPC9hZGRyPgoJCQkJCQkJCQk8dGVsZWNvbSB2YWx1ZT0idGVsOig1NTUpNTU1LTEwMDMiLz4KCQkJCQkJCQkJPHBsYXlpbmdFbnRpdHk+CgkJCQkJCQkJCQk8bmFtZT4KCQkJCQkJCQkJCQk8cHJlZml4PkRyLjwvcHJlZml4PgoJCQkJCQkJCQkJCTxmYW1pbHk+RG9saW48L2ZhbWlseT4KCQkJCQkJCQkJCQk8Z2l2ZW4+Um9iZXJ0PC9naXZlbj4KCQkJCQkJCQkJCTwvbmFtZT4KCQkJCQkJCQkJPC9wbGF5aW5nRW50aXR5PgoJCQkJCQkJCTwvcGFydGljaXBhbnRSb2xlPgoJCQkJCQkJPC9wYXJ0aWNpcGFudD4KCQkJCQkJCTxyZWZlcmVuY2UgdHlwZUNvZGU9IlJFRlIiPgoJCQkJCQkJCTxzZXBlcmF0YWJsZUluZCB2YWx1ZT0iZmFsc2UiLz4KCQkJCQkJCQk8ZXh0ZXJuYWxEb2N1bWVudD4KCQkJCQkJCQkJPGlkIHJvb3Q9ImI1MGI3OTEwLTdmZmItNGY0Yy1iYmU0LTE3N2VkNjhjYmJmMyIvPgoJCQkJCQkJCQk8dGV4dCBtZWRpYVR5cGU9ImFwcGxpY2F0aW9uL3BkZiI+CgkJCQkJCQkJCQk8cmVmZXJlbmNlCgkJCQkJCQkJCQkJdmFsdWU9IkFkdmFuY2VEaXJlY3RpdmUuYjUwYjc5MTAtN2ZmYi00ZjRjLWJiZTQtMTc3ZWQ2OGNiYmYzLnBkZiIKCQkJCQkJCQkJCS8+CgkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQk8L2V4dGVybmFsRG9jdW1lbnQ+CgkJCQkJCQk8L3JlZmVyZW5jZT4KCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQk8L2VudHJ5PgoJCQkJPC9zZWN0aW9uPgoJCQk8L2NvbXBvbmVudD4KCQkJPCEtLSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogQWxsZXJnaWVzLCBBZHZlcnNlIFJlYWN0aW9ucywgQWxlcnRzICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAtLT4KCQkJPGNvbXBvbmVudD4KCQkJCTxzZWN0aW9uPgoJCQkJCTwhLS0gY29uZm9ybXMgdG8gQWxsZXJnaWVzIHNlY3Rpb24gd2l0aCBlbnRyaWVzIG9wdGlvbmFsIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuNiIvPgoJCQkJCTwhLS0gQWxsZXJnaWVzIHNlY3Rpb24gd2l0aCBlbnRyaWVzIHJlcXVpcmVkIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuNi4xIi8+CgkJCQkJPGNvZGUgY29kZT0iNDg3NjUtMiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+CgkJCQkJPHRpdGxlPkFMTEVSR0lFUywgQURWRVJTRSBSRUFDVElPTlMsIEFMRVJUUzwvdGl0bGU+CgkJCQkJPHRleHQ+CgkJCQkJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4KCQkJCQkJCTx0aGVhZD4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aD5TdWJzdGFuY2U8L3RoPgoJCQkJCQkJCQk8dGg+T3ZlcmFsbCBTZXZlcml0eTwvdGg+CgkJCQkJCQkJCTx0aD5SZWFjdGlvbjwvdGg+CgkJCQkJCQkJCTx0aD5SZWFjdGlvbiBTZXZlcml0eTwvdGg+CgkJCQkJCQkJCTx0aD5TdGF0dXM8L3RoPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQk8L3RoZWFkPgoJCQkJCQkJPHRib2R5PgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPkFMTEVSR0VOSUMgRVhUUkFDVCwgUEVOSUNJTExJTjwvdGQ+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJzZXZlcml0eTQiPk1vZGVyYXRlIHRvIFNldmVyZTwvY29udGVudD4KCQkJCQkJCQkJPC90ZD4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9InJlYWN0aW9uMSI+TmF1c2VhPC9jb250ZW50PgoJCQkJCQkJCQk8L3RkPgoJCQkJCQkJCQk8dGQ+CgkJCQkJCQkJCQk8Y29udGVudCBJRD0ic2V2ZXJpdHkxIj5NaWxkPC9jb250ZW50PgoJCQkJCQkJCQk8L3RkPgoJCQkJCQkJCQk8dGQ+SW5hY3RpdmU8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+Q29kZWluZTwvdGQ+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJzZXZlcml0eTUiPk1pbGQ8L2NvbnRlbnQ+CgkJCQkJCQkJCTwvdGQ+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJyZWFjdGlvbjIiPldoZWV6aW5nPC9jb250ZW50PgoJCQkJCQkJCQk8L3RkPgoJCQkJCQkJCQk8dGQ+CgkJCQkJCQkJCQk8Y29udGVudCBJRD0ic2V2ZXJpdHkyIj5Nb2RlcmF0ZTwvY29udGVudD4KCQkJCQkJCQkJPC90ZD4KCQkJCQkJCQkJPHRkPkFjdGl2ZTwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD5Bc3BpcmluPC90ZD4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9InNldmVyaXR5NiI+TWlsZDwvY29udGVudD4KCQkJCQkJCQkJPC90ZD4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9InJlYWN0aW9uMyI+SGl2ZXM8L2NvbnRlbnQ+CgkJCQkJCQkJCTwvdGQ+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJzZXZlcml0eTMiPk1pbGQgdG8gbW9kZXJhdGU8L2NvbnRlbnQ+CgkJCQkJCQkJCTwvdGQ+CgkJCQkJCQkJCTx0ZD5BY3RpdmU8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQk8L3Rib2R5PgoJCQkJCQk8L3RhYmxlPgoJCQkJCTwvdGV4dD4KCQkJCQk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPgoJCQkJCQk8YWN0IGNsYXNzQ29kZT0iQUNUIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCTwhLS0gKiogQWxsZXJneSBwcm9ibGVtIGFjdCAqKiAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMzAiLz4KCQkJCQkJCTxpZCByb290PSIzNmUzZTkzMC03YjE0LTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4KCQkJCQkJCTxjb2RlIGNvZGU9IjQ4NzY1LTIiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iTE9JTkMiCgkJCQkJCQkJZGlzcGxheU5hbWU9IkFsbGVyZ2llcywgYWR2ZXJzZSByZWFjdGlvbnMsIGFsZXJ0cyIvPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iYWN0aXZlIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwNzA1MDEiLz4KCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIEFsbGVyZ3kgb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNyIvPgoJCQkJCQkJCQk8aWQgcm9vdD0iNGFkYzEwMjAtN2IxNC0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQkJCTxjb2RlIGNvZGU9IkFTU0VSVElPTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40Ii8+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQkJCTxsb3cgdmFsdWU9IjIwMDcwNTAxIi8+CgkJCQkJCQkJCTwvZWZmZWN0aXZlVGltZT4KCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNDE5NTExMDAzIgoJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlByb3BlbnNpdHkgdG8gYWR2ZXJzZSByZWFjdGlvbnMgdG8gZHJ1ZyIKCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIENUIj4KCQkJCQkJCQkJCTxvcmlnaW5hbFRleHQ+CgkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI3JlYWN0aW9uMSIvPgoJCQkJCQkJCQkJPC9vcmlnaW5hbFRleHQ+CgkJCQkJCQkJCTwvdmFsdWU+CgkJCQkJCQkJCTxwYXJ0aWNpcGFudCB0eXBlQ29kZT0iQ1NNIj4KCQkJCQkJCQkJCTxwYXJ0aWNpcGFudFJvbGUgY2xhc3NDb2RlPSJNQU5VIj4KCQkJCQkJCQkJCQk8cGxheWluZ0VudGl0eSBjbGFzc0NvZGU9Ik1NQVQiPgoJCQkJCQkJCQkJCQk8Y29kZSBjb2RlPSIzMTQ0MjIiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJBTExFUkdFTklDIEVYVFJBQ1QsIFBFTklDSUxMSU4iCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuODgiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJSeE5vcm0iPgoJCQkJCQkJCQkJCQk8b3JpZ2luYWxUZXh0PgoJCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjcmVhY3Rpb24xIi8+CgkJCQkJCQkJCQkJCTwvb3JpZ2luYWxUZXh0PgoJCQkJCQkJCQkJCQk8L2NvZGU+CgkJCQkJCQkJCQkJPC9wbGF5aW5nRW50aXR5PgoJCQkJCQkJCQkJPC9wYXJ0aWNpcGFudFJvbGU+CgkJCQkJCQkJCTwvcGFydGljaXBhbnQ+CgkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBBbGxlcmd5IHN0YXR1cyBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjI4Ii8+CgkJCQkJCQkJCQkJPGNvZGUgY29kZT0iMzM5OTktNCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iTE9JTkMiIGRpc3BsYXlOYW1lPSJTdGF0dXMiLz4KCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNFIiBjb2RlPSI3MzQyNTAwNyIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IkluYWN0aXZlIi8+CgkJCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9Ik1GU1QiIGludmVyc2lvbkluZD0idHJ1ZSI+CgkJCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQkJCTwhLS0gKiogUmVhY3Rpb24gb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC45Ii8+CgkJCQkJCQkJCQkJPGlkIHJvb3Q9IjRhZGMxMDIwLTdiMTQtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NCIvPgoJCQkJCQkJCQkJCTxjb2RlIG51bGxGbGF2b3I9Ik5BIi8+CgkJCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNyZWFjdGlvbjEiLz4KCQkJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJCQkJCTxsb3cgdmFsdWU9IjIwMDcwNTAxIi8+CgkJCQkJCQkJCQkJCTxoaWdoIHZhbHVlPSIyMDA5MDIyNzEzMDAwMCswNTAwIi8+CgkJCQkJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjQyMjU4NzAwNyIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9Ik5hdXNlYSIvPgoJCQkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4KCQkJCQkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJCQkJPCEtLSAqKiBTZXZlcml0eSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC44Ii8+CgkJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IlNFViIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlNldmVyaXR5IE9ic2VydmF0aW9uIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJBY3RDb2RlIi8+CgkJCQkJCQkJCQkJCTx0ZXh0PgoJCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjc2V2ZXJpdHk0Ii8+CgkJCQkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjI1NTYwNDAwMiIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9Ik1pbGQiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiLz4KCQkJCQkJCQkJCQkJPGludGVycHJldGF0aW9uQ29kZSBjb2RlPSJTIgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iU3VjZXB0aWJsZSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMS4xMS43OCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9Ik9ic2VydmF0aW9uIEludGVycHJldGF0aW9uIi8+CgkJCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+CgkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBTZXZlcml0eSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjgiLz4KCQkJCQkJCQkJCQk8Y29kZSBjb2RlPSJTRVYiIGRpc3BsYXlOYW1lPSJTZXZlcml0eSBPYnNlcnZhdGlvbiIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iQWN0Q29kZSIvPgoJCQkJCQkJCQkJCTx0ZXh0PgoJCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjc2V2ZXJpdHkyIi8+CgkJCQkJCQkJCQkJPC90ZXh0PgoJCQkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjM3MTkyNDAwOSIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9Ik1vZGVyYXRlIHRvIHNldmVyZSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIvPgoJCQkJCQkJCQkJCTxpbnRlcnByZXRhdGlvbkNvZGUgY29kZT0iTiIgZGlzcGxheU5hbWU9Ik5vcm1hbCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMS4xMS43OCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9Ik9ic2VydmF0aW9uIEludGVycHJldGF0aW9uIi8+CgkJCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQk8L2FjdD4KCQkJCQk8L2VudHJ5PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBBbGxlcmd5IHByb2JsZW0gYWN0ICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4zMCIvPgoJCQkJCQkJPGlkIHJvb3Q9IjM2ZTNlOTMwLTdiMTQtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJPGNvZGUgY29kZT0iNDg3NjUtMiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIgoJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIKCQkJCQkJCQlkaXNwbGF5TmFtZT0iQWxsZXJnaWVzLCBhZHZlcnNlIHJlYWN0aW9ucywgYWxlcnRzIi8+CgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJhY3RpdmUiLz4KCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDA2MDUwMSIvPgoJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIiBpbnZlcnNpb25JbmQ9InRydWUiPgoJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCTwhLS0gKiogQWxsZXJneSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC43Ii8+CgkJCQkJCQkJCTxpZCByb290PSI0YWRjMTAyMC03YjE0LTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4KCQkJCQkJCQkJPGNvZGUgY29kZT0iQVNTRVJUSU9OIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiLz4KCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lPgoJCQkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwNjA1MDEiLz4KCQkJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSI0MTk1MTEwMDMiCgkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iUHJvcGVuc2l0eSB0byBhZHZlcnNlIHJlYWN0aW9ucyB0byBkcnVnIgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiPgoJCQkJCQkJCQkJPG9yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjcmVhY3Rpb24yIi8+CgkJCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQkJPC92YWx1ZT4KCQkJCQkJCQkJPHBhcnRpY2lwYW50IHR5cGVDb2RlPSJDU00iPgoJCQkJCQkJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9Ik1BTlUiPgoJCQkJCQkJCQkJCTxwbGF5aW5nRW50aXR5IGNsYXNzQ29kZT0iTU1BVCI+CgkJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjI2NzAiIGRpc3BsYXlOYW1lPSJDb2RlaW5lIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljg4IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iUnhOb3JtIj4KCQkJCQkJCQkJCQkJPG9yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI3JlYWN0aW9uMiIvPgoJCQkJCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQkJPC9jb2RlPgoJCQkJCQkJCQkJCTwvcGxheWluZ0VudGl0eT4KCQkJCQkJCQkJCTwvcGFydGljaXBhbnRSb2xlPgoJCQkJCQkJCQk8L3BhcnRpY2lwYW50PgoJCQkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlNVQkoiIGludmVyc2lvbkluZD0idHJ1ZSI+CgkJCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQkJCTwhLS0gKiogQWxsZXJneSBzdGF0dXMgb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yOCIvPgoJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjMzOTk5LTQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkxPSU5DIiBkaXNwbGF5TmFtZT0iU3RhdHVzIi8+CgkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRSIgY29kZT0iNTU1NjEwMDMiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJBY3RpdmUiLz4KCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+CgkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iTUZTVCIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBSZWFjdGlvbiBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjkiLz4KCQkJCQkJCQkJCQk8aWQgcm9vdD0iNGFkYzEwMjAtN2IxNC0xMWRiLTlmZTEtMDgwMDIwMGM5YTY0Ii8+CgkJCQkJCQkJCQkJPGNvZGUgbnVsbEZsYXZvcj0iTkEiLz4KCQkJCQkJCQkJCQk8dGV4dD4KCQkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI3JlYWN0aW9uMiIvPgoJCQkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwNjA1MDEiLz4KCQkJCQkJCQkJCQkJPGhpZ2ggdmFsdWU9IjIwMDkwMjI3MTMwMDAwKzA1MDAiLz4KCQkJCQkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNTYwMTgwMDQiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJXaGVlemluZyIvPgoJCQkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4KCQkJCQkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJCQkJPCEtLSAqKiBTZXZlcml0eSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC44Ii8+CgkJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IlNFViIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlNldmVyaXR5IE9ic2VydmF0aW9uIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJBY3RDb2RlIi8+CgkJCQkJCQkJCQkJCTx0ZXh0PgoJCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjc2V2ZXJpdHk1Ii8+CgkJCQkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjI1NTYwNDAwMiIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9Ik1pbGQiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiLz4KCQkJCQkJCQkJCQkJPGludGVycHJldGF0aW9uQ29kZSBjb2RlPSJTIgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iU3VjZXB0aWJsZSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMS4xMS43OCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9Ik9ic2VydmF0aW9uIEludGVycHJldGF0aW9uIi8+CgkJCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+CgkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBTZXZlcml0eSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjgiLz4KCQkJCQkJCQkJCQk8Y29kZSBjb2RlPSJTRVYiIGRpc3BsYXlOYW1lPSJTZXZlcml0eSBPYnNlcnZhdGlvbiIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iQWN0Q29kZSIvPgoJCQkJCQkJCQkJCTx0ZXh0PgoJCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjc2V2ZXJpdHkyIi8+CgkJCQkJCQkJCQkJPC90ZXh0PgoJCQkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjY3MzYwMDciCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJNb2RlcmF0ZSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIvPgoJCQkJCQkJCQkJCTxpbnRlcnByZXRhdGlvbkNvZGUgY29kZT0iTiIgZGlzcGxheU5hbWU9Ik5vcm1hbCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMS4xMS43OCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9Ik9ic2VydmF0aW9uIEludGVycHJldGF0aW9uIi8+CgkJCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQk8L2FjdD4KCQkJCQk8L2VudHJ5PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBBbGxlcmd5IHByb2JsZW0gYWN0ICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4zMCIvPgoJCQkJCQkJPGlkIHJvb3Q9IjM2ZTNlOTMwLTdiMTQtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJPGNvZGUgY29kZT0iNDg3NjUtMiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIgoJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIKCQkJCQkJCQlkaXNwbGF5TmFtZT0iQWxsZXJnaWVzLCBhZHZlcnNlIHJlYWN0aW9ucywgYWxlcnRzIi8+CgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJhY3RpdmUiLz4KCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDA4MDUwMSIvPgoJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIiBpbnZlcnNpb25JbmQ9InRydWUiPgoJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCTwhLS0gKiogQWxsZXJneSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC43Ii8+CgkJCQkJCQkJCTxpZCByb290PSI0YWRjMTAyMC03YjE0LTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4KCQkJCQkJCQkJPGNvZGUgY29kZT0iQVNTRVJUSU9OIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiLz4KCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lPgoJCQkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwODA1MDEiLz4KCQkJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSI1OTAzNzAwNyIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJEcnVnIGludG9sZXJhbmNlIgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiPgoJCQkJCQkJCQkJPG9yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjcmVhY3Rpb24zIi8+CgkJCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQkJPC92YWx1ZT4KCQkJCQkJCQkJPHBhcnRpY2lwYW50IHR5cGVDb2RlPSJDU00iPgoJCQkJCQkJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9Ik1BTlUiPgoJCQkJCQkJCQkJCTxwbGF5aW5nRW50aXR5IGNsYXNzQ29kZT0iTU1BVCI+CgkJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjExOTEiIGRpc3BsYXlOYW1lPSJBc3BpcmluIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljg4IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iUnhOb3JtIj4KCQkJCQkJCQkJCQkJPG9yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI3JlYWN0aW9uMyIvPgoJCQkJCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQkJPC9jb2RlPgoJCQkJCQkJCQkJCTwvcGxheWluZ0VudGl0eT4KCQkJCQkJCQkJCTwvcGFydGljaXBhbnRSb2xlPgoJCQkJCQkJCQk8L3BhcnRpY2lwYW50PgoJCQkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlNVQkoiIGludmVyc2lvbkluZD0idHJ1ZSI+CgkJCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQkJCTwhLS0gKiogQWxsZXJneSBzdGF0dXMgb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yOCIvPgoJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjMzOTk5LTQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkxPSU5DIiBkaXNwbGF5TmFtZT0iU3RhdHVzIi8+CgkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRSIgY29kZT0iNTU1NjEwMDMiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJBY3RpdmUiLz4KCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+CgkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iTUZTVCIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBSZWFjdGlvbiBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjkiLz4KCQkJCQkJCQkJCQk8aWQgcm9vdD0iNGFkYzEwMjAtN2IxNC0xMWRiLTlmZTEtMDgwMDIwMGM5YTY0Ii8+CgkJCQkJCQkJCQkJPGNvZGUgbnVsbEZsYXZvcj0iTkEiLz4KCQkJCQkJCQkJCQk8dGV4dD4KCQkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI3JlYWN0aW9uMyIvPgoJCQkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwODA1MDEiLz4KCQkJCQkJCQkJCQkJPGhpZ2ggdmFsdWU9IjIwMDkwMjI3MTMwMDAwKzA1MDAiLz4KCQkJCQkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iMjQ3NDcyMDA0IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iSGl2ZXMiLz4KCQkJCQkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlNVQkoiIGludmVyc2lvbkluZD0idHJ1ZSI+CgkJCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJCTwhLS0gKiogU2V2ZXJpdHkgb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuOCIvPgoJCQkJCQkJCQkJCQk8Y29kZSBjb2RlPSJTRVYiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJTZXZlcml0eSBPYnNlcnZhdGlvbiIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iQWN0Q29kZSIvPgoJCQkJCQkJCQkJCQk8dGV4dD4KCQkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI3NldmVyaXR5NiIvPgoJCQkJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSIzNzE5MjMwMDMiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJNaWxkIHRvIG1vZGVyYXRlIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIENUIi8+CgkJCQkJCQkJCQkJCTxpbnRlcnByZXRhdGlvbkNvZGUgY29kZT0iUyIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlN1Y2VwdGlibGUiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjEuMTEuNzgiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJPYnNlcnZhdGlvbiBJbnRlcnByZXRhdGlvbiIvPgoJCQkJCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+CgkJCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlNVQkoiIGludmVyc2lvbkluZD0idHJ1ZSI+CgkJCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQkJCTwhLS0gKiogU2V2ZXJpdHkgb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC44Ii8+CgkJCQkJCQkJCQkJPGNvZGUgY29kZT0iU0VWIiBkaXNwbGF5TmFtZT0iU2V2ZXJpdHkgT2JzZXJ2YXRpb24iCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkFjdENvZGUiLz4KCQkJCQkJCQkJCQk8dGV4dD4KCQkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI3NldmVyaXR5MyIvPgoJCQkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSIzNzE5MjMwMDMiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJNaWxkIHRvIG1vZGVyYXRlIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIENUIi8+CgkJCQkJCQkJCQkJPGludGVycHJldGF0aW9uQ29kZSBjb2RlPSJOIiBkaXNwbGF5TmFtZT0iTm9ybWFsIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My4xLjExLjc4IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iT2JzZXJ2YXRpb24gSW50ZXJwcmV0YXRpb24iLz4KCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+CgkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+CgkJCQkJCTwvYWN0PgoJCQkJCTwvZW50cnk+CgkJCQk8L3NlY3Rpb24+CgkJCTwvY29tcG9uZW50PgoJCQk8IS0tICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBBU1NFU1NNRU5UICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAtLT4KCQkJPGNvbXBvbmVudD4KCQkJCTxzZWN0aW9uPgoJCQkJCTwhLS0gQXNzZXNzbWVudCBzZWN0aW9uIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuOCIvPgoJCQkJCTxjb2RlIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIgY29kZVN5c3RlbU5hbWU9IkxPSU5DIiBjb2RlPSI1MTg0OC0wIgoJCQkJCQlkaXNwbGF5TmFtZT0iQVNTRVNTTUVOVCIvPgoJCQkJCTx0aXRsZT5BU1NFU1NNRU5UPC90aXRsZT4KCQkJCQk8dGV4dD4KCQkJCQkJPGxpc3QgbGlzdFR5cGU9Im9yZGVyZWQiPgoJCQkJCQkJPGl0ZW0+UmVjdXJyZW50IEdJIGJsZWVkIG9mIHVua25vd24gZXRpb2xvZ3k7IGh5cG90ZW5zaW9uIHBlcmhhcHMKCQkJCQkJCQlzZWNvbmRhcnkgdG8gdGhpcyBidXQgYXMgbGlrZWx5IHNlY29uZGFyeSB0byBwb2x5cGhhcm1hY3kuPC9pdGVtPgoJCQkJCQkJPGl0ZW0+QWN1dGUgb24gY2hyb25pYyBhbmVtaWEgc2Vjb25kYXJ5IHRvICMxLjwvaXRlbT4KCQkJCQkJCTxpdGVtPkF6b3RlbWlhLCBhY3V0ZSByZW5hbCBmYWlsdXJlIHdpdGggdm9sdW1lIGxvc3Mgc2Vjb25kYXJ5IHRvCgkJCQkJCQkJIzEuPC9pdGVtPgoJCQkJCQkJPGl0ZW0+SHlwZXJrYWxlbWlhIHNlY29uZGFyeSB0byAjMyBhbmQgb24gQUNFIGFuZCBLKyBzdXBwbGVtZW50LjwvaXRlbT4KCQkJCQkJCTxpdGVtPk90aGVyIGNocm9uaWMgZGlhZ25vc2VzIGFzIG5vdGVkIGFib3ZlLCBjdXJyZW50bHkgc3RhYmxlLjwvaXRlbT4KCQkJCQkJPC9saXN0PgoJCQkJCTwvdGV4dD4KCQkJCTwvc2VjdGlvbj4KCQkJPC9jb21wb25lbnQ+CgkJCTwhLS0gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBFTkNPVU5URVJTICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC0tPgoJCQk8Y29tcG9uZW50PgoJCQkJPHNlY3Rpb24+CgkJCQkJPCEtLSBjb25mb3JtcyB0byBFbmNvdW50ZXJzIHNlY3Rpb24gd2l0aCBlbnRyaWVzIG9wdGlvbmFsIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuMjIiLz4KCQkJCQk8IS0tIEVuY291bnRlcnMgc2VjdGlvbiB3aXRoIGVudHJpZXMgcmVxdWlyZWQgLS0+CgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuMi4yMi4xIi8+CgkJCQkJPGNvZGUgY29kZT0iNDYyNDAtOCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBjb2RlU3lzdGVtTmFtZT0iTE9JTkMiCgkJCQkJCWRpc3BsYXlOYW1lPSJIaXN0b3J5IG9mIGVuY291bnRlcnMiLz4KCQkJCQk8dGl0bGU+RU5DT1VOVEVSUzwvdGl0bGU+CgkJCQkJPHRleHQ+CgkJCQkJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4KCQkJCQkJCTx0aGVhZD4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aD5FbmNvdW50ZXI8L3RoPgoJCQkJCQkJCQk8dGg+UGVyZm9ybWVyPC90aD4KCQkJCQkJCQkJPHRoPkxvY2F0aW9uPC90aD4KCQkJCQkJCQkJPHRoPkRhdGU8L3RoPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQk8L3RoZWFkPgoJCQkJCQkJPHRib2R5PgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9IkVuY291bnRlcjEiLz4gQ2hlY2t1cCBFeGFtaW5hdGlvbiA8L3RkPgoJCQkJCQkJCQk8dGQ+UGVyZm9ybWVyIE5hbWU8L3RkPgoJCQkJCQkJCQk8dGQ+Q29tbXVuaXR5IFVyZ2VudCBDYXJlIENlbnRlcjwvdGQ+CgkJCQkJCQkJCTx0ZD4yMDA5MDIyNzEzMDAwMCswNTAwPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJPC90Ym9keT4KCQkJCQkJPC90YWJsZT4KCQkJCQk8L3RleHQ+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPGVuY291bnRlciBjbGFzc0NvZGU9IkVOQyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQk8IS0tICoqIEVuY291bnRlciBhY3Rpdml0aWVzICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC40OSIvPgoJCQkJCQkJPGlkIHJvb3Q9IjJhNjIwMTU1LTlkMTEtNDM5ZS05MmIzLTVkOTgxNWZmNGRlOCIvPgoJCQkJCQkJPGNvZGUgY29kZT0iOTkyMTMiIGRpc3BsYXlOYW1lPSJPZmZpY2Ugb3V0cGF0aWVudCB2aXNpdCAxNSBtaW51dGVzIgoJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJDUFQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMTIiCgkJCQkJCQkJY29kZVN5c3RlbVZlcnNpb249IjQiPgoJCQkJCQkJCTxvcmlnaW5hbFRleHQ+IENoZWNrdXAgRXhhbWluYXRpb24gPHJlZmVyZW5jZSB2YWx1ZT0iI0VuY291bnRlcjEiLz4KCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQk8dHJhbnNsYXRpb24gY29kZT0iQU1CIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiCgkJCQkJCQkJCWRpc3BsYXlOYW1lPSJBbWJ1bGF0b3J5IiBjb2RlU3lzdGVtTmFtZT0iSEw3IEFjdEVuY291bnRlckNvZGUiLz4KCQkJCQkJCTwvY29kZT4KCQkJCQkJCTwhLS0gRmVicnVhcnkgMjcsIDIwMDkgYXQgMTowMFBNIEVTVCAtLT4KCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDA5MDIyNzEzMDAwMCswNTAwIi8+CgkJCQkJCQk8cGVyZm9ybWVyPgoJCQkJCQkJCTxhc3NpZ25lZEVudGl0eT4KCQkJCQkJCQkJPCEtLSBQcm92aWRlciBOUEkgIlBzZWR1b01ELTMiIC0tPgoJCQkJCQkJCQk8aWQgcm9vdD0iUHNlZHVvTUQtMyIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSI1OTA1ODAwMSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiIGRpc3BsYXlOYW1lPSJHZW5lcmFsIFBoeXNpY2lhbiIvPgoJCQkJCQkJCTwvYXNzaWduZWRFbnRpdHk+CgkJCQkJCQk8L3BlcmZvcm1lcj4KCQkJCQkJCTxwYXJ0aWNpcGFudCB0eXBlQ29kZT0iTE9DIj4KCQkJCQkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iU0RMT0MiPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjMyIi8+CgkJCQkJCQkJCTwhLS0gU2VydmljZSBEZWxpdmVyeSBMb2NhdGlvbiB0ZW1wbGF0ZSAtLT4KCQkJCQkJCQkJPGNvZGUgY29kZT0iMTE2MC0xIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjI1OSIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJIZWFsdGhjYXJlU2VydmljZUxvY2F0aW9uIgoJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlVyZ2VudCBDYXJlIENlbnRlciIvPgoJCQkJCQkJCQk8YWRkcj4KCQkJCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xNyBEYXdzIFJkLjwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQkJCQkJCQk8Y2l0eT5CbHVlIEJlbGw8L2NpdHk+CgkJCQkJCQkJCQk8c3RhdGU+TUE8L3N0YXRlPgoJCQkJCQkJCQkJPHBvc3RhbENvZGU+MDIzNjg8L3Bvc3RhbENvZGU+CgkJCQkJCQkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJCQkJCQkJPC9hZGRyPgoJCQkJCQkJCQk8dGVsZWNvbSBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPHBsYXlpbmdFbnRpdHkgY2xhc3NDb2RlPSJQTEMiPgoJCQkJCQkJCQkJPG5hbWU+Q29tbXVuaXR5IFVyZ2VudCBDYXJlIENlbnRlcjwvbmFtZT4KCQkJCQkJCQkJPC9wbGF5aW5nRW50aXR5PgoJCQkJCQkJCTwvcGFydGljaXBhbnRSb2xlPgoJCQkJCQkJPC9wYXJ0aWNpcGFudD4KCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUlNPTiI+CgkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4xOSIvPgoJCQkJCQkJCQk8aWQgcm9vdD0iZGI3MzQ2NDctZmM5OS00MjRjLWE4NjQtN2UzY2RhODJlNzAzIgoJCQkJCQkJCQkJZXh0ZW5zaW9uPSI0NTY2NSIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSI0MDQ2ODQwMDMiIGRpc3BsYXlOYW1lPSJGaW5kaW5nIgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiLz4KCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lPgoJCQkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwNzAxMDMiLz4KCQkJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSIyMzM2MDQwMDciIGRpc3BsYXlOYW1lPSJQbmV1bW9uaWEiCgkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2Ii8+CgkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+CgkJCQkJCTwvZW5jb3VudGVyPgoJCQkJCTwvZW50cnk+CgkJCQk8L3NlY3Rpb24+CgkJCTwvY29tcG9uZW50PgoJCQk8IS0tICoqKioqKioqKioqKioqKioqKioqKioqKiBGQU1JTFkgSElTVE9SWSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC0tPgoJCQk8Y29tcG9uZW50PgoJCQkJPHNlY3Rpb24+CgkJCQkJPCEtLSBGYW1pbHkgaGlzdG9yeSBzZWN0aW9uIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuMTUiLz4KCQkJCQk8Y29kZSBjb2RlPSIxMDE1Ny02IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiLz4KCQkJCQk8dGl0bGU+RkFNSUxZIEhJU1RPUlk8L3RpdGxlPgoJCQkJCTx0ZXh0PgoJCQkJCQk8cGFyYWdyYXBoPkZhdGhlciAoZGVjZWFzZWQpPC9wYXJhZ3JhcGg+CgkJCQkJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4KCQkJCQkJCTx0aGVhZD4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aD5EaWFnbm9zaXM8L3RoPgoJCQkJCQkJCQk8dGg+QWdlIEF0IE9uc2V0PC90aD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJPC90aGVhZD4KCQkJCQkJCTx0Ym9keT4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD5NeW9jYXJkaWFsIEluZmFyY3Rpb24gKGNhdXNlIG9mIGRlYXRoKTwvdGQ+CgkJCQkJCQkJCTx0ZD41NzwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD5EaWFiZXRlczwvdGQ+CgkJCQkJCQkJCTx0ZD40MDwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGJvZHk+CgkJCQkJCTwvdGFibGU+CgkJCQkJPC90ZXh0PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxvcmdhbml6ZXIgbW9vZENvZGU9IkVWTiIgY2xhc3NDb2RlPSJDTFVTVEVSIj4KCQkJCQkJCTwhLS0gKiogRmFtaWx5IGhpc3Rvcnkgb3JnYW5pemVyICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC40NSIvPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8c3ViamVjdD4KCQkJCQkJCQk8cmVsYXRlZFN1YmplY3QgY2xhc3NDb2RlPSJQUlMiPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSJGVEgiIGRpc3BsYXlOYW1lPSJGYXRoZXIiCgkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iRmFtaWx5UmVsYXRpb25zaGlwUm9sZVR5cGUiCgkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjExMSI+CgkJCQkJCQkJCQk8dHJhbnNsYXRpb24gY29kZT0iOTk0NzAwOCIgZGlzcGxheU5hbWU9IkJpb2xvZ2ljYWwgZmF0aGVyIgoJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQiCgkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIvPgoJCQkJCQkJCQk8L2NvZGU+CgkJCQkJCQkJCTxzdWJqZWN0PgoJCQkJCQkJCQkJPHNkdGM6aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNS45OTk5OS4yIgoJCQkJCQkJCQkJCWV4dGVuc2lvbj0iOTk5OTk5OTkiLz4KCQkJCQkJCQkJCTxhZG1pbmlzdHJhdGl2ZUdlbmRlckNvZGUgY29kZT0iTSIKCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjEiIGRpc3BsYXlOYW1lPSJNYWxlIi8+CgkJCQkJCQkJCQk8YmlydGhUaW1lIHZhbHVlPSIxOTEwIi8+CgkJCQkJCQkJCQk8IS0tIEV4YW1wbGUgdXNlIG9mIHNkdGMgZXh0ZW5zaW9ucyBpbmNsdWRlZCBiZWxvdyBpbiBjb21tZW50cyAtLT4KCQkJCQkJCQkJCTwhLS0gPHNkdGM6ZGVjZWFzZWRJbmQgdmFsdWU9InRydWUiLz4gPHNkdGM6ZGVjZWFzZWRUaW1lIHZhbHVlPSIxOTY3Ii8+IC0tPgoJCQkJCQkJCQk8L3N1YmplY3Q+CgkJCQkJCQkJPC9yZWxhdGVkU3ViamVjdD4KCQkJCQkJCTwvc3ViamVjdD4KCQkJCQkJCTxjb21wb25lbnQ+CgkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJPCEtLSAqKiBGYW1pbHkgaGlzdG9yeSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC40NiIvPgoJCQkJCQkJCQk8aWQgcm9vdD0iZDQyZWJmNzAtNWM4OS0xMWRiLWIwZGUtMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQkJCTxjb2RlIGNvZGU9IjY0NTcyMDAxIiBkaXNwbGF5TmFtZT0iQ29uZGl0aW9uIgoJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIKCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiLz4KCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIxOTY3Ii8+CgkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjIyMjk4MDA2IgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJNeW9jYXJkaWFsIGluZmFyY3Rpb24iLz4KCQkJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJDQVVTIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBGYW1pbHkgaGlzdG9yeSBkZWF0aCBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjQ3Ii8+CgkJCQkJCQkJCQkJPGlkIHJvb3Q9IjY4OThmYWUwLTVjOGEtMTFkYi1iMGRlLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IkFTU0VSVElPTiIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40Ii8+CgkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNDE5MDk5MDA5IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iRGVhZCIvPgoJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIiBpbnZlcnNpb25JbmQ9InRydWUiPgoJCQkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJCQk8IS0tICoqIEFnZSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjMxIi8+CgkJCQkJCQkJCQkJPGNvZGUgY29kZT0iNDQ1NTE4MDA4IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iQWdlIEF0IE9uc2V0Ii8+CgkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9IjU3IiB1bml0PSJhIi8+CgkJCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQk8L2NvbXBvbmVudD4KCQkJCQkJCTxjb21wb25lbnQ+CgkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJPCEtLSAqKiBGYW1pbHkgaGlzdG9yeSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC40NiIvPgoJCQkJCQkJCQk8aWQgcm9vdD0iNWJmZTNlYzAtNWM4Yi0xMWRiLWIwZGUtMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQkJCTxjb2RlIGNvZGU9IjY0NTcyMDAxIiBkaXNwbGF5TmFtZT0iQ29uZGl0aW9uIgoJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIKCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiLz4KCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIxOTUwIi8+CgkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjQ0MDU0MDA2IgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJEaWFiZXRlcyBtZWxsaXR1cyB0eXBlIDIiLz4KCQkJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIiBpbnZlcnNpb25JbmQ9InRydWUiPgoJCQkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJCQk8IS0tICoqIEFnZSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjMxIi8+CgkJCQkJCQkJCQkJPGNvZGUgY29kZT0iNDQ1NTE4MDA4IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iQWdlIEF0IE9uc2V0Ii8+CgkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9IjQwIiB1bml0PSJhIi8+CgkJCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQk8L2NvbXBvbmVudD4KCQkJCQkJPC9vcmdhbml6ZXI+CgkJCQkJPC9lbnRyeT4KCQkJCTwvc2VjdGlvbj4KCQkJPC9jb21wb25lbnQ+CgkJCTwhLS0gKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBGVU5DVElPTkFMIFNUQVRVUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogLS0+CgkJCTxjb21wb25lbnQ+CgkJCQk8c2VjdGlvbj4KCQkJCQk8IS0tIEZ1bmN0aW9uYWwgc3RhdHVzIHNlY3Rpb24gLS0+CgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuMi4xNCIvPgoJCQkJCTxjb2RlIGNvZGU9IjQ3NDIwLTUiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIvPgoJCQkJCTx0aXRsZT5GdW5jdGlvbmFsIFN0YXR1czwvdGl0bGU+CgkJCQkJPHRleHQ+CgkJCQkJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4KCQkJCQkJCTx0aGVhZD4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aD5GdW5jdGlvbmFsIG9yIENvZ25pdGl2ZSBGaW5kaW5nPC90aD4KCQkJCQkJCQkJPHRoPk9ic2VydmF0aW9uPC90aD4KCQkJCQkJCQkJPHRoPk9ic2VydmF0aW9uIERhdGU8L3RoPgoJCQkJCQkJCQk8dGg+Q29uZGl0aW9uIFN0YXR1czwvdGg+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGhlYWQ+CgkJCQkJCQk8dGJvZHk+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+PGNvbnRlbnQgSUQ9IkZVTkMxIj5BbWJ1bGF0aW9uKERlcGVuZGVudCB0bwoJCQkJCQkJCQkJCUluZGVwZW5kZW50KTwvY29udGVudD48L3RkPgoJCQkJCQkJCQk8dGQ+SW5kZXBlbmRlbnRseSBhYmxlPC90ZD4KCQkJCQkJCQkJPHRkPk1hcmNoIDExLCAyMDA5PC90ZD4KCQkJCQkJCQkJPHRkPkFjdGl2ZTwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD48Y29udGVudCBJRD0iRlVOQzIiPkZpbmRpbmcgb2YgRnVuY3Rpb25hbCBQZXJmb3JtYW5jZSBhbmQKCQkJCQkJCQkJCQlBY3Rpdml0eTwvY29udGVudD48L3RkPgoJCQkJCQkJCQk8dGQ+RHlzcG5lYTwvdGQ+CgkJCQkJCQkJCTx0ZD5GZWJydWFyeSAyMDA3PC90ZD4KCQkJCQkJCQkJPHRkPkFjdGl2ZTwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD5Db2duaXRpdmUgRnVuY3Rpb24gRmluZGluZzwvdGQ+CgkJCQkJCQkJCTx0ZD48Y29udGVudCBJRD0iQ09HMiI+TWVtb3J5IGltcGFpcm1lbnQ8L2NvbnRlbnQ+PC90ZD4KCQkJCQkJCQkJPHRkPkFwcmlsIDIwMDc8L3RkPgoJCQkJCQkJCQk8dGQ+QWN0aXZlPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPjxjb250ZW50IElEPSJDT0cxIj5Db2duaXRpdmUgRnVuY3Rpb24gRmluZGluZyhOb24tQWdncmVzc2l2ZQoJCQkJCQkJCQkJCXRvIEFnZ3Jlc3NpdmUpPC9jb250ZW50PjwvdGQ+CgkJCQkJCQkJCTx0ZD5BZ2dyZXNzaXZlIGJlaGF2aW9yPC90ZD4KCQkJCQkJCQkJPHRkPk1hcmNoIDExLCAyMDA5PC90ZD4KCQkJCQkJCQkJPHRkPkFjdGl2ZTwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGJvZHk+CgkJCQkJCTwvdGFibGU+CgkJCQkJPC90ZXh0PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxvcmdhbml6ZXIgY2xhc3NDb2RlPSJDTFVTVEVSIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMSIvPgoJCQkJCQkJPCEtLSAqKiBjb25mb3JtcyB0byBSZXN1bHQgT3JnYW5pemVyICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC42NiIvPgoJCQkJCQkJPCEtLSBGdW5jdGlvbmFsIFN0YXR1cyBSZXN1bHQgT3JnYW5pemVyIHRlbXBsYXRlIC0tPgoJCQkJCQkJPGlkIHJvb3Q9IjkyOTVkYmE0LWRmMDUtNDZiYi1iOTRlLWYyYzRlNGIxNTZmOCIvPgoJCQkJCQkJPGNvZGUgY29kZT0iZDUiIGRpc3BsYXlOYW1lPSJTZWxmLUNhcmUiCgkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4yNTQiIGNvZGVTeXN0ZW1OYW1lPSJJQ0YiLz4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGNvbXBvbmVudD4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIGNvbmZvcm1zIHRvIFJlc3VsdCBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yIi8+CgkJCQkJCQkJCTwhLS0gKiogRnVuY3Rpb25hbCBzdGF0dXMgcmVzdWx0IG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjY3Ii8+CgkJCQkJCQkJCTxpZCByb290PSJjNmI1YTA0Yi0yYmY0LTQ5ZDEtODMzNi02MzZhMzgxM2RmMGEiLz4KCQkJCQkJCQkJPGNvZGUgY29kZT0iNTcyNTEtMSIgZGlzcGxheU5hbWU9IkFtYnVsYXRpb24iCgkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIvPgoJCQkJCQkJCQk8dGV4dD4KCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNGVU5DMSIvPgoJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwOTAzMTExMjMwIi8+CgkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjM3MTE1MzAwNiIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJJbmRlcGVuZGVudGx5IGFibGUiCgkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIvPgoJCQkJCQkJCQk8aW50ZXJwcmV0YXRpb25Db2RlIGNvZGU9IkIiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODMiLz4KCQkJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJDT01QIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBBc3Nlc3NtZW50IHNjYWxlIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNjkiLz4KCQkJCQkJCQkJCQk8aWQgcm9vdD0iYzZiNWEwNGItMmJmNC00OWQxLTgzMzYtNjM2YTM4MTNkZjBiIi8+CgkJCQkJCQkJCQkJPGNvZGUgY29kZT0iNTQ2MTQtMyIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IkJyaWVmIEludGVydmlldyBmb3IgTWVudGFsIFN0YXR1cyIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iTE9JTkMiLz4KCQkJCQkJCQkJCQk8ZGVyaXZhdGlvbkV4cHI+VGV4dCBkZXNjcmlwdGlvbiBvZiB0aGUKCQkJCQkJCQkJCQkJY2FsY3VsYXRpb248L2Rlcml2YXRpb25FeHByPgoJCQkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDEyMDIxNCIvPgoJCQkJCQkJCQkJCTwhLS0gU3VtbWVkIHNjb3JlIG9mIHRoZSBjb21wb25lbnQgdmFsdWVzIC0tPgoJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iSU5UIiB2YWx1ZT0iNyIvPgoJCQkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iQ09NUCI+CgkJCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJCTwhLS0gKiogQXNzZXNzbWVudCBzY2FsZSBzdXBwb3J0aW5nIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40Ljg2Ii8+CgkJCQkJCQkJCQkJCTxpZCByb290PSJmNGRjZTc5MC04MzI4LTExZGItOWZlMS0wODAwMjAwYzlhMzMiLz4KCQkJCQkJCQkJCQkJPGNvZGUgY29kZT0iNTI3MzEtNyIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlJlcGV0aXRpb24gb2YgVGhyZWUgV29yZHMiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkxPSU5DIi8+CgkJCQkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSJMQTYzOTUtMyIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlRocmVlIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiLz4KCQkJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iQ09NUCI+CgkJCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJCTwhLS0gKiogQXNzZXNzbWVudCBzY2FsZSBzdXBwb3J0aW5nIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40Ljg2Ii8+CgkJCQkJCQkJCQkJCTxpZCByb290PSJmNGRjZTc5MC04MzI4LTExZGItOWZlMS0wODAwMjAwYzlhMjIiLz4KCQkJCQkJCQkJCQkJPGNvZGUgY29kZT0iNTI3MzItNSIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlRlbXBvcmFsIG9yaWVudGF0aW9uIC0gY3VycmVudCB5ZWFyIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIvPgoJCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iTEExMDk2Ni0yIgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iTWlzc2VkIGJ5IDItNSB5ZWFycyIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+CgkJCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlJFRlIiPgoJCQkJCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQkJCQk8IS0tICoqIENhcmVnaXZlciBjaGFyYWN0ZXJpc3RpY3MgKiogLS0+CgkJCQkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNzIiLz4KCQkJCQkJCQkJCQkJPGlkIHJvb3Q9ImM2YjVhMDRiLTJiZjQtNDlkMS04MzM2LTYzNmEzODEzZGYwYyIvPgoJCQkJCQkJCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPgoJCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNDIyNjE1MDAxIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iY2FyZWdpdmVyIGRpZmZpY3VsdHkgcHJvdmlkaW5nIHBoeXNpY2FsIGNhcmUiLz4KCQkJCQkJCQkJCQkJPHBhcnRpY2lwYW50IHR5cGVDb2RlPSJJTkQiPgoJCQkJCQkJCQkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iQ0FSRUdJVkVSIj4KCQkJCQkJCQkJCQkJPGNvZGUgY29kZT0iTVRIIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjExMSIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9Ik1vdGhlciIvPgoJCQkJCQkJCQkJCQk8L3BhcnRpY2lwYW50Um9sZT4KCQkJCQkJCQkJCQkJPC9wYXJ0aWNpcGFudD4KCQkJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJPC9jb21wb25lbnQ+CgkJCQkJCTwvb3JnYW5pemVyPgoJCQkJCTwvZW50cnk+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCTwhLS0gKiogY29uZm9ybXMgdG8gUHJvYmxlbSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNCIvPgoJCQkJCQkJPCEtLSAqKiBGdW5jdGlvbmFsIHN0YXR1cyBwcm9ibGVtIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC42OCIvPgoJCQkJCQkJPGlkIHJvb3Q9IjA4ZWRiN2MwLTIxMTEtNDNmMi1hNzg0LTlhNWZkZmFhNjdmMCIvPgoJCQkJCQkJPGNvZGUgY29kZT0iMjQ4NTM2MDA2IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCWRpc3BsYXlOYW1lPSJGaW5kaW5nIG9mIEZ1bmN0aW9uYWwgUGVyZm9ybWFuY2UgYW5kIEFjdGl2aXR5Ii8+CgkJCQkJCQk8dGV4dD4KCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjRlVOQzIiLz4KCQkJCQkJCTwvdGV4dD4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwNzAyIi8+CgkJCQkJCQkJPGhpZ2ggdmFsdWU9IjIwMDcwNCIvPgoJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iIDE2Mjg5MTAwNyIKCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iZHlzcG5lYSIvPgoJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCTwvZW50cnk+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCTwhLS0gKiogY29uZm9ybXMgdG8gUHJvYmxlbSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNCIvPgoJCQkJCQkJPCEtLSAqKiBDb2duaXRpdmUgc3RhdHVzIHByb2JsZW0gb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjczIi8+CgkJCQkJCQk8aWQgcm9vdD0iMDhlZGI3YzAtMjExMS00M2YyLWE3ODQtOWE1ZmRmYWE2N2YwIi8+CgkJCQkJCQk8Y29kZSBjb2RlPSIzNzM5MzAwMDAiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJZGlzcGxheU5hbWU9IkNvZ25pdGl2ZSBGdW5jdGlvbiBGaW5kaW5nIi8+CgkJCQkJCQk8dGV4dD4KCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjQ09HMiIvPgoJCQkJCQkJPC90ZXh0PgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA3MDQiLz4KCQkJCQkJCQk8aGlnaCB2YWx1ZT0iMjAwNzA2Ii8+CgkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSIzODY4MDcwMDYiCgkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9Ik1lbW9yeSBpbXBhaXJtZW50IgoJCQkJCQkJLz4KCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQk8L2VudHJ5PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxvcmdhbml6ZXIgY2xhc3NDb2RlPSJDTFVTVEVSIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCTwhLS0gKiogY29uZm9ybXMgdG8gUmVzdWx0IG9yZ2FuaXplciAqKiAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMSIvPgoJCQkJCQkJPCEtLSAqKiBDb2duaXRpdmUgc3RhdHVzIHJlc3VsdCBvcmdhbml6ZXIgKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40Ljc1Ii8+CgkJCQkJCQk8aWQgcm9vdD0iOTI5NWRiYTQtZGYwNS00NmJiLWI5NGUtZjJjNGU0YjE1NmY4Ii8+CgkJCQkJCQk8Y29kZSBjb2RlPSJkMyIgZGlzcGxheU5hbWU9IkNvbW11bmljYXRpb24iCgkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4yNTQiIGNvZGVTeXN0ZW1OYW1lPSJJQ0YiLz4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGNvbXBvbmVudD4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIGNvbmZvcm1zIHRvIFJlc3VsdCBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yIi8+CgkJCQkJCQkJCTwhLS0gKiogQ29nbml0aXZlIHN0YXR1cyByZXN1bHQgb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNzQiLz4KCQkJCQkJCQkJPGlkIHJvb3Q9ImM2YjVhMDRiLTJiZjQtNDlkMS04MzM2LTYzNmEzODEzZGYwYSIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSIzNzM5MzAwMDAiIGRpc3BsYXlOYW1lPSJDb2duaXRpdmUgZnVuY3Rpb24gZmluZGluZyIKCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIENUIi8+CgkJCQkJCQkJCTx0ZXh0PgoJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI0NPRzEiLz4KCQkJCQkJCQkJPC90ZXh0PgoJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMDkwMzExMTIzMCIvPgoJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSI2MTM3MjAwMSIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJBZ2dyZXNzaXZlIGJlaGF2aW9yIgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiLz4KCQkJCQkJCQkJPGludGVycHJldGF0aW9uQ29kZSBjb2RlPSJISCIKCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODMiLz4KCQkJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJDT01QIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBBc3Nlc3NtZW50IHNjYWxlIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNjkiLz4KCQkJCQkJCQkJCQk8aWQgcm9vdD0iYzZiNWEwNGItMmJmNC00OWQxLTgzMzYtNjM2YTM4MTNkZjBiMSIvPgoJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjI0ODI0MTAwMiIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IkJyaWVmIEludGVydmlldyBmb3IgTWVudGFsIFN0YXR1cyIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iTE9JTkMiLz4KCQkJCQkJCQkJCQk8ZGVyaXZhdGlvbkV4cHI+VGV4dCBkZXNjcmlwdGlvbiBvZiB0aGUKCQkJCQkJCQkJCQkJY2FsY3VsYXRpb248L2Rlcml2YXRpb25FeHByPgoJCQkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDEyMDIxNCIvPgoJCQkJCQkJCQkJCTwhLS0gU3VtbWVkIHNjb3JlIG9mIHRoZSBjb21wb25lbnQgdmFsdWVzIC0tPgoJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iSU5UIiB2YWx1ZT0iNyIvPgoJCQkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iQ09NUCI+CgkJCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJCTwhLS0gKiogQXNzZXNzbWVudCBzY2FsZSBzdXBwb3J0aW5nIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40Ljg2Ii8+CgkJCQkJCQkJCQkJCTxpZCByb290PSJmNGRjZTc5MC04MzI4LTExZGItOWZlMS0wODAwMjAwYzlhMzMiLz4KCQkJCQkJCQkJCQkJPGNvZGUgY29kZT0iNTI3MzEtNyIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlJlcGV0aXRpb24gb2YgVGhyZWUgV29yZHMiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkxPSU5DIi8+CgkJCQkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSJMQTYzOTUtMyIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlRocmVlIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiLz4KCQkJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iQ09NUCI+CgkJCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJCTwhLS0gKiogQXNzZXNzbWVudCBzY2FsZSBzdXBwb3J0aW5nIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40Ljg2Ii8+CgkJCQkJCQkJCQkJCTxpZCByb290PSJmNGRjZTc5MC04MzI4LTExZGItOWZlMS0wODAwMjAwYzlhMjIiLz4KCQkJCQkJCQkJCQkJPGNvZGUgY29kZT0iNTI3MzItNSIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlRlbXBvcmFsIG9yaWVudGF0aW9uIC0gY3VycmVudCB5ZWFyIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIvPgoJCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iTEExMDk2Ni0yIgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iTWlzc2VkIGJ5IDItNSB5ZWFycyIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+CgkJCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlJFRlIiPgoJCQkJCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQkJCQk8IS0tICoqIENhcmVnaXZlciBjaGFyYWN0ZXJpc3RpY3MgKiogLS0+CgkJCQkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNzIiLz4KCQkJCQkJCQkJCQkJPGlkIHJvb3Q9ImM2YjVhMDRiLTJiZjQtNDlkMS04MzM2LTYzNmEzODEzZGYwYyIvPgoJCQkJCQkJCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPgoJCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNDIyNjE1MDAxIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iY2FyZWdpdmVyIGRpZmZpY3VsdHkgcHJvdmlkaW5nIHBoeXNpY2FsIGNhcmUiLz4KCQkJCQkJCQkJCQkJPHBhcnRpY2lwYW50IHR5cGVDb2RlPSJJTkQiPgoJCQkJCQkJCQkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iQ0FSRUdJVkVSIj4KCQkJCQkJCQkJCQkJPGNvZGUgY29kZT0iTVRIIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjExMSIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9Ik1vdGhlciIvPgoJCQkJCQkJCQkJCQk8L3BhcnRpY2lwYW50Um9sZT4KCQkJCQkJCQkJCQkJPC9wYXJ0aWNpcGFudD4KCQkJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQkJPHJlZmVyZW5jZVJhbmdlPgoJCQkJCQkJCQkJPG9ic2VydmF0aW9uUmFuZ2U+CgkJCQkJCQkJCQkJPHRleHQ+Tm9uIEFnZ3Jlc3NpdmUgdG8gQWdncmVzc2l2ZTwvdGV4dD4KCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb25SYW5nZT4KCQkJCQkJCQkJPC9yZWZlcmVuY2VSYW5nZT4KCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJPC9jb21wb25lbnQ+CgkJCQkJCTwvb3JnYW5pemVyPgoJCQkJCTwvZW50cnk+CgkJCQk8L3NlY3Rpb24+CgkJCTwvY29tcG9uZW50PgoJCQk8IS0tICoqKioqKioqKioqKioqKioqKioqIElNTVVOSVpBVElPTlMgKioqKioqKioqKioqKioqKioqKioqIC0tPgoJCQk8Y29tcG9uZW50PgoJCQkJPHNlY3Rpb24+CgkJCQkJPCEtLSBjb25mb3JtcyB0byBJbW11bml6YXRpb25zIHNlY3Rpb24gd2l0aCBlbnRyaWVzIG9wdGlvbmFsIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuMiIvPgoJCQkJCTwhLS0gSW1tdW5pemF0aW9ucyBzZWN0aW9uIHdpdGggZW50cmllcyByZXF1aXJlZCAtLT4KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi4yLjIuMSIvPgoJCQkJCTxjb2RlIGNvZGU9IjExMzY5LTYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIgY29kZVN5c3RlbU5hbWU9IkxPSU5DIgoJCQkJCQlkaXNwbGF5TmFtZT0iSGlzdG9yeSBvZiBpbW11bml6YXRpb25zIi8+CgkJCQkJPHRpdGxlPklNTVVOSVpBVElPTlM8L3RpdGxlPgoJCQkJCTx0ZXh0PgoJCQkJCQk8Y29udGVudCBJRD0iaW1tdW5TZWN0Ii8+CgkJCQkJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4KCQkJCQkJCTx0aGVhZD4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aD5WYWNjaW5lPC90aD4KCQkJCQkJCQkJPHRoPkRhdGU8L3RoPgoJCQkJCQkJCQk8dGg+U3RhdHVzPC90aD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJPC90aGVhZD4KCQkJCQkJCTx0Ym9keT4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJpbW1pMSIvPiBJbmZsdWVuemEsIHNlYXNvbmFsLCBJTSA8L3RkPgoJCQkJCQkJCQk8dGQ+Tm92IDE5OTk8L3RkPgoJCQkJCQkJCQk8dGQ+Q29tcGxldGVkPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9ImltbWkyIi8+IEluZmx1ZW56YSwgc2Vhc29uYWwsIElNIDwvdGQ+CgkJCQkJCQkJCTx0ZD5EZWMgMTk5ODwvdGQ+CgkJCQkJCQkJCTx0ZD5Db21wbGV0ZWQ8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+CgkJCQkJCQkJCQk8Y29udGVudCBJRD0iaW1taTMiLz4gUG5ldW1vY29jY2FsIHBvbHlzYWNjaGFyaWRlIHZhY2NpbmUsCgkJCQkJCQkJCQlJTSA8L3RkPgoJCQkJCQkJCQk8dGQ+RGVjIDE5OTg8L3RkPgoJCQkJCQkJCQk8dGQ+Q29tcGxldGVkPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9ImltbWk0Ii8+IFRldGFudXMgYW5kIGRpcGh0aGVyaWEgdG94b2lkcywgSU0gPC90ZD4KCQkJCQkJCQkJPHRkPjE5OTc8L3RkPgoJCQkJCQkJCQk8dGQ+UmVmdXNlZDwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGJvZHk+CgkJCQkJCTwvdGFibGU+CgkJCQkJPC90ZXh0PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxzdWJzdGFuY2VBZG1pbmlzdHJhdGlvbiBjbGFzc0NvZGU9IlNCQURNIiBtb29kQ29kZT0iRVZOIgoJCQkJCQkJbmVnYXRpb25JbmQ9ImZhbHNlIj4KCQkJCQkJCTwhLS0gKiogSW1tdW5pemF0aW9uIGFjdGl2aXR5ICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC41MiIvPgoJCQkJCQkJPGlkIHJvb3Q9ImU2ZjFiYTQzLWMwZWQtNGI5Yi05ZjEyLWY0MzVkOGFkOGY5MiIvPgoJCQkJCQkJPHRleHQ+CgkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI2ltbXVuMSIvPgoJCQkJCQkJPC90ZXh0PgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZSB4c2k6dHlwZT0iSVZMX1RTIiB2YWx1ZT0iMTk5OTExIi8+CgkJCQkJCQk8cm91dGVDb2RlIGNvZGU9IkMyODE2MSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMy4yNi4xLjEiCgkJCQkJCQkJY29kZVN5c3RlbU5hbWU9Ik5hdGlvbmFsIENhbmNlciBJbnN0aXR1dGUgKE5DSSkgVGhlc2F1cnVzIgoJCQkJCQkJCWRpc3BsYXlOYW1lPSJJbnRyYW11c2N1bGFyIGluamVjdGlvbiIvPgoJCQkJCQkJPGRvc2VRdWFudGl0eSB2YWx1ZT0iNTAiIHVuaXQ9Im1jZyIvPgoJCQkJCQkJPGNvbnN1bWFibGU+CgkJCQkJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3QgY2xhc3NDb2RlPSJNQU5VIj4KCQkJCQkJCQkJPCEtLSAqKiBJbW11bml6YXRpb24gbWVkaWNhdGlvbiBpbmZvcm1hdGlvbiAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC41NCIvPgoJCQkJCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+CgkJCQkJCQkJCQk8Y29kZSBjb2RlPSI4OCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMTIuMjkyIgoJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJJbmZsdWVuemEgdmlydXMgdmFjY2luZSIKCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iQ1ZYIj4KCQkJCQkJCQkJCQk8b3JpZ2luYWxUZXh0PgoJCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjaW1taTEiLz4KCQkJCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQk8dHJhbnNsYXRpb24gY29kZT0iMTQxIgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iSW5mbHVlbnphLCBzZWFzb25hbCwgaW5qZWN0YWJsZSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkNWWCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMTIuMjkyIi8+CgkJCQkJCQkJCQk8L2NvZGU+CgkJCQkJCQkJCQk8bG90TnVtYmVyVGV4dD4xPC9sb3ROdW1iZXJUZXh0PgoJCQkJCQkJCQk8L21hbnVmYWN0dXJlZE1hdGVyaWFsPgoJCQkJCQkJCQk8bWFudWZhY3R1cmVyT3JnYW5pemF0aW9uPgoJCQkJCQkJCQkJPG5hbWU+SGVhbHRoIExTIC0gSW1tdW5vIEluYy48L25hbWU+CgkJCQkJCQkJCTwvbWFudWZhY3R1cmVyT3JnYW5pemF0aW9uPgoJCQkJCQkJCTwvbWFudWZhY3R1cmVkUHJvZHVjdD4KCQkJCQkJCTwvY29uc3VtYWJsZT4KCQkJCQkJCTxwZXJmb3JtZXI+CgkJCQkJCQkJPGFzc2lnbmVkRW50aXR5PgoJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNS45OTk5LjQ1NiIgZXh0ZW5zaW9uPSIyOTgxODI0Ii8+CgkJCQkJCQkJCTxhZGRyPgoJCQkJCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjEwMjEgSGVhbHRoIERyaXZlPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCTxjaXR5PkFubiBBcmJvcjwvY2l0eT4KCQkJCQkJCQkJCTxzdGF0ZT5NSTwvc3RhdGU+CgkJCQkJCQkJCQk8cG9zdGFsQ29kZT45OTA5OTwvcG9zdGFsQ29kZT4KCQkJCQkJCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQkJCQkJCQk8L2FkZHI+CgkJCQkJCQkJCTx0ZWxlY29tIG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJCQk8YXNzaWduZWRQZXJzb24+CgkJCQkJCQkJCQk8bmFtZT4KCQkJCQkJCQkJCQk8Z2l2ZW4+QW1hbmRhPC9naXZlbj4KCQkJCQkJCQkJCQk8ZmFtaWx5PkFzc2lnbmVkPC9mYW1pbHk+CgkJCQkJCQkJCQk8L25hbWU+CgkJCQkJCQkJCTwvYXNzaWduZWRQZXJzb24+CgkJCQkJCQkJCTxyZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4KCQkJCQkJCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ljk5OTkuMTM5NCIvPgoJCQkJCQkJCQkJPG5hbWU+R29vZCBIZWFsdGggQ2xpbmljPC9uYW1lPgoJCQkJCQkJCQkJPHRlbGVjb20gbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQk8YWRkciBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPC9yZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4KCQkJCQkJCQk8L2Fzc2lnbmVkRW50aXR5PgoJCQkJCQkJPC9wZXJmb3JtZXI+CgkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlNVQkoiIGludmVyc2lvbkluZD0iZmFsc2UiPgoJCQkJCQkJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJJTlQiPgoJCQkJCQkJCQk8IS0tICoqIEluc3RydWN0aW9ucyAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yMCIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSIxNzEwNDQwMDMiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iaW1tdW5pemF0aW9uIGVkdWNhdGlvbiIvPgoJCQkJCQkJCQk8dGV4dD4KCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNpbW11blNlY3QiLz4gUG9zc2libGUgZmx1LWxpa2Ugc3ltcHRvbXMKCQkJCQkJCQkJCWZvciB0aHJlZSBkYXlzLiA8L3RleHQ+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCTwvYWN0PgoJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJPC9zdWJzdGFuY2VBZG1pbmlzdHJhdGlvbj4KCQkJCQk8L2VudHJ5PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxzdWJzdGFuY2VBZG1pbmlzdHJhdGlvbiBjbGFzc0NvZGU9IlNCQURNIiBtb29kQ29kZT0iRVZOIiBuZWdhdGlvbkluZD0idHJ1ZSI+CgkJCQkJCQk8IS0tICoqIEltbXVuaXphdGlvbiBhY3Rpdml0eSAqKiAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNTIiLz4KCQkJCQkJCTxpZCByb290PSJlNmYxYmE0My1jMGVkLTRiOWItOWYxMi1mNDM1ZDhhZDhmOTIiLz4KCQkJCQkJCTx0ZXh0PgoJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNpbW11bjIiLz4KCQkJCQkJCTwvdGV4dD4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IklWTF9UUyIgdmFsdWU9IjE5OTgxMjE1Ii8+CgkJCQkJCQk8cm91dGVDb2RlIGNvZGU9IkMyODE2MSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMy4yNi4xLjEiCgkJCQkJCQkJY29kZVN5c3RlbU5hbWU9Ik5hdGlvbmFsIENhbmNlciBJbnN0aXR1dGUgKE5DSSkgVGhlc2F1cnVzIgoJCQkJCQkJCWRpc3BsYXlOYW1lPSJJbnRyYW11c2N1bGFyIGluamVjdGlvbiIvPgoJCQkJCQkJPGRvc2VRdWFudGl0eSB2YWx1ZT0iNTAiIHVuaXQ9Im1jZyIvPgoJCQkJCQkJPGNvbnN1bWFibGU+CgkJCQkJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3QgY2xhc3NDb2RlPSJNQU5VIj4KCQkJCQkJCQkJPCEtLSAqKiBJbW11bml6YXRpb24gbWVkaWNhdGlvbiBpbmZvcm1hdGlvbiAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC41NCIvPgoJCQkJCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+CgkJCQkJCQkJCQk8Y29kZSBjb2RlPSI4OCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMTIuMjkyIgoJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJJbmZsdWVuemEgdmlydXMgdmFjY2luZSIKCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iQ1ZYIj4KCQkJCQkJCQkJCQk8b3JpZ2luYWxUZXh0PgoJCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjaW1taTIiLz4KCQkJCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQk8dHJhbnNsYXRpb24gY29kZT0iMTQxIgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iSW5mbHVlbnphLCBzZWFzb25hbCwgaW5qZWN0YWJsZSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkNWWCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMTIuMjkyIi8+CgkJCQkJCQkJCQk8L2NvZGU+CgkJCQkJCQkJCQk8bG90TnVtYmVyVGV4dD4xPC9sb3ROdW1iZXJUZXh0PgoJCQkJCQkJCQk8L21hbnVmYWN0dXJlZE1hdGVyaWFsPgoJCQkJCQkJCQk8bWFudWZhY3R1cmVyT3JnYW5pemF0aW9uPgoJCQkJCQkJCQkJPG5hbWU+SGVhbHRoIExTIC0gSW1tdW5vIEluYy48L25hbWU+CgkJCQkJCQkJCTwvbWFudWZhY3R1cmVyT3JnYW5pemF0aW9uPgoJCQkJCQkJCTwvbWFudWZhY3R1cmVkUHJvZHVjdD4KCQkJCQkJCTwvY29uc3VtYWJsZT4KCQkJCQkJCTxwZXJmb3JtZXI+CgkJCQkJCQkJPGFzc2lnbmVkRW50aXR5PgoJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNS45OTk5LjQ1NiIgZXh0ZW5zaW9uPSIyOTgxODI0Ii8+CgkJCQkJCQkJCTxhZGRyPgoJCQkJCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjEwMjEgSGVhbHRoIERyaXZlPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCTxjaXR5PkFubiBBcmJvcjwvY2l0eT4KCQkJCQkJCQkJCTxzdGF0ZT5NSTwvc3RhdGU+CgkJCQkJCQkJCQk8cG9zdGFsQ29kZT45OTA5OTwvcG9zdGFsQ29kZT4KCQkJCQkJCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQkJCQkJCQk8L2FkZHI+CgkJCQkJCQkJCTx0ZWxlY29tIG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJCQk8YXNzaWduZWRQZXJzb24+CgkJCQkJCQkJCQk8bmFtZT4KCQkJCQkJCQkJCQk8Z2l2ZW4+QW1hbmRhPC9naXZlbj4KCQkJCQkJCQkJCQk8ZmFtaWx5PkFzc2lnbmVkPC9mYW1pbHk+CgkJCQkJCQkJCQk8L25hbWU+CgkJCQkJCQkJCTwvYXNzaWduZWRQZXJzb24+CgkJCQkJCQkJCTxyZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4KCQkJCQkJCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ljk5OTkuMTM5NCIvPgoJCQkJCQkJCQkJPG5hbWU+R29vZCBIZWFsdGggQ2xpbmljPC9uYW1lPgoJCQkJCQkJCQkJPHRlbGVjb20gbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQk8YWRkciBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPC9yZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4KCQkJCQkJCQk8L2Fzc2lnbmVkRW50aXR5PgoJCQkJCQkJPC9wZXJmb3JtZXI+CgkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlNVQkoiIGludmVyc2lvbkluZD0idHJ1ZSI+CgkJCQkJCQkJPGFjdCBjbGFzc0NvZGU9IkFDVCIgbW9vZENvZGU9IklOVCI+CgkJCQkJCQkJCTwhLS0gKiogSW5zdHJ1Y3Rpb25zICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjIwIi8+CgkJCQkJCQkJCTxjb2RlIGNvZGU9IjE3MTA0NDAwMyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJpbW11bml6YXRpb24gZWR1Y2F0aW9uIi8+CgkJCQkJCQkJCTx0ZXh0PgoJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI2ltbXVuU2VjdCIvPiBQb3NzaWJsZSBmbHUtbGlrZSBzeW1wdG9tcwoJCQkJCQkJCQkJZm9yIHRocmVlIGRheXMuIDwvdGV4dD4KCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJPC9hY3Q+CgkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQk8L3N1YnN0YW5jZUFkbWluaXN0cmF0aW9uPgoJCQkJCTwvZW50cnk+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPHN1YnN0YW5jZUFkbWluaXN0cmF0aW9uIGNsYXNzQ29kZT0iU0JBRE0iIG1vb2RDb2RlPSJFVk4iCgkJCQkJCQluZWdhdGlvbkluZD0iZmFsc2UiPgoJCQkJCQkJPCEtLSAqKiBJbW11bml6YXRpb24gYWN0aXZpdHkgKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjUyIi8+CgkJCQkJCQk8aWQgcm9vdD0iZTZmMWJhNDMtYzBlZC00YjliLTlmMTItZjQzNWQ4YWQ4ZjkyIi8+CgkJCQkJCQk8dGV4dD4KCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjaW1tdW4zIi8+CgkJCQkJCQk8L3RleHQ+CgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHhzaTp0eXBlPSJJVkxfVFMiIHZhbHVlPSIxOTk4MTIxNSIvPgoJCQkJCQkJPHJvdXRlQ29kZSBjb2RlPSJDMjgxNjEiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjMuMjYuMS4xIgoJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJOYXRpb25hbCBDYW5jZXIgSW5zdGl0dXRlIChOQ0kpIFRoZXNhdXJ1cyIKCQkJCQkJCQlkaXNwbGF5TmFtZT0iSW50cmFtdXNjdWxhciBpbmplY3Rpb24iLz4KCQkJCQkJCTxkb3NlUXVhbnRpdHkgdmFsdWU9IjUwIiB1bml0PSJtY2ciLz4KCQkJCQkJCTxjb25zdW1hYmxlPgoJCQkJCQkJCTxtYW51ZmFjdHVyZWRQcm9kdWN0IGNsYXNzQ29kZT0iTUFOVSI+CgkJCQkJCQkJCTwhLS0gKiogSW1tdW5pemF0aW9uIG1lZGljYXRpb24gaW5mb3JtYXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNTQiLz4KCQkJCQkJCQkJPG1hbnVmYWN0dXJlZE1hdGVyaWFsPgoJCQkJCQkJCQkJPGNvZGUgY29kZT0iMzMiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjEyLjI5MiIKCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iUG5ldW1vY29jY2FsIHBvbHlzYWNjaGFyaWRlIHZhY2NpbmUiCgkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkNWWCI+CgkJCQkJCQkJCQkJPG9yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI2ltbWkzIi8+CgkJCQkJCQkJCQkJPC9vcmlnaW5hbFRleHQ+CgkJCQkJCQkJCQkJPHRyYW5zbGF0aW9uIGNvZGU9IjEwOSIgZGlzcGxheU5hbWU9IlBuZXVtb2NvY2NhbCBOT1MiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJDVlgiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjEyLjI5MiIvPgoJCQkJCQkJCQkJPC9jb2RlPgoJCQkJCQkJCQkJPGxvdE51bWJlclRleHQ+MTwvbG90TnVtYmVyVGV4dD4KCQkJCQkJCQkJPC9tYW51ZmFjdHVyZWRNYXRlcmlhbD4KCQkJCQkJCQkJPG1hbnVmYWN0dXJlck9yZ2FuaXphdGlvbj4KCQkJCQkJCQkJCTxuYW1lPkhlYWx0aCBMUyAtIEltbXVubyBJbmMuPC9uYW1lPgoJCQkJCQkJCQk8L21hbnVmYWN0dXJlck9yZ2FuaXphdGlvbj4KCQkJCQkJCQk8L21hbnVmYWN0dXJlZFByb2R1Y3Q+CgkJCQkJCQk8L2NvbnN1bWFibGU+CgkJCQkJCQk8cGVyZm9ybWVyPgoJCQkJCQkJCTxhc3NpZ25lZEVudGl0eT4KCQkJCQkJCQkJPGlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5LjUuOTk5OS40NTYiIGV4dGVuc2lvbj0iMjk4MTgyNCIvPgoJCQkJCQkJCQk8YWRkcj4KCQkJCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xMDIxIEhlYWx0aCBEcml2ZTwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQkJCQkJCQk8Y2l0eT5Bbm4gQXJib3I8L2NpdHk+CgkJCQkJCQkJCQk8c3RhdGU+TUk8L3N0YXRlPgoJCQkJCQkJCQkJPHBvc3RhbENvZGU+OTkwOTk8L3Bvc3RhbENvZGU+CgkJCQkJCQkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJCQkJCQkJPC9hZGRyPgoJCQkJCQkJCQk8dGVsZWNvbSBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPGFzc2lnbmVkUGVyc29uPgoJCQkJCQkJCQkJPG5hbWU+CgkJCQkJCQkJCQkJPGdpdmVuPkFtYW5kYTwvZ2l2ZW4+CgkJCQkJCQkJCQkJPGZhbWlseT5Bc3NpZ25lZDwvZmFtaWx5PgoJCQkJCQkJCQkJPC9uYW1lPgoJCQkJCQkJCQk8L2Fzc2lnbmVkUGVyc29uPgoJCQkJCQkJCQk8cmVwcmVzZW50ZWRPcmdhbml6YXRpb24+CgkJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNS45OTk5LjEzOTQiLz4KCQkJCQkJCQkJCTxuYW1lPkdvb2QgSGVhbHRoIENsaW5pYzwvbmFtZT4KCQkJCQkJCQkJCTx0ZWxlY29tIG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJCQkJPGFkZHIgbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCTwvcmVwcmVzZW50ZWRPcmdhbml6YXRpb24+CgkJCQkJCQkJPC9hc3NpZ25lZEVudGl0eT4KCQkJCQkJCTwvcGVyZm9ybWVyPgoJCQkJCQk8L3N1YnN0YW5jZUFkbWluaXN0cmF0aW9uPgoJCQkJCTwvZW50cnk+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPHN1YnN0YW5jZUFkbWluaXN0cmF0aW9uIGNsYXNzQ29kZT0iU0JBRE0iIG1vb2RDb2RlPSJFVk4iIG5lZ2F0aW9uSW5kPSJ0cnVlIj4KCQkJCQkJCTwhLS0gKiogSW1tdW5pemF0aW9uIGFjdGl2aXR5ICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC41MiIvPgoJCQkJCQkJPGlkIHJvb3Q9ImU2ZjFiYTQzLWMwZWQtNGI5Yi05ZjEyLWY0MzVkOGFkOGY5MiIvPgoJCQkJCQkJPHRleHQ+CgkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI2ltbXVuNCIvPgoJCQkJCQkJPC90ZXh0PgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZSB4c2k6dHlwZT0iSVZMX1RTIiB2YWx1ZT0iMTk5ODEyMTUiLz4KCQkJCQkJCTxyb3V0ZUNvZGUgY29kZT0iQzI4MTYxIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My4zLjI2LjEuMSIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iTmF0aW9uYWwgQ2FuY2VyIEluc3RpdHV0ZSAoTkNJKSBUaGVzYXVydXMiCgkJCQkJCQkJZGlzcGxheU5hbWU9IkludHJhbXVzY3VsYXIgaW5qZWN0aW9uIi8+CgkJCQkJCQk8ZG9zZVF1YW50aXR5IHZhbHVlPSI1MCIgdW5pdD0ibWNnIi8+CgkJCQkJCQk8Y29uc3VtYWJsZT4KCQkJCQkJCQk8bWFudWZhY3R1cmVkUHJvZHVjdCBjbGFzc0NvZGU9Ik1BTlUiPgoJCQkJCQkJCQk8IS0tICoqIEltbXVuaXphdGlvbiBtZWRpY2F0aW9uIElpbmZvcm1hdGlvbiAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC41NCIvPgoJCQkJCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+CgkJCQkJCQkJCQk8Y29kZSBjb2RlPSIxMDMiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjEyLjI5MiIKCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iVGV0YW51cyBhbmQgZGlwaHRoZXJpYSB0b3hvaWRzIC0gcHJlc2VydmF0aXZlIGZyZWUiCgkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkNWWCI+CgkJCQkJCQkJCQkJPG9yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI2ltbWk0Ii8+CgkJCQkJCQkJCQkJPC9vcmlnaW5hbFRleHQ+CgkJCQkJCQkJCQkJPHRyYW5zbGF0aW9uIGNvZGU9IjA5IgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iVGV0YW51cyBhbmQgZGlwaHRoZXJpYSB0b3hvaWRzIC0gcHJlc2VydmF0aXZlIGZyZWUiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJDVlgiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjEyLjI5MiIvPgoJCQkJCQkJCQkJPC9jb2RlPgoJCQkJCQkJCQkJPGxvdE51bWJlclRleHQ+MTwvbG90TnVtYmVyVGV4dD4KCQkJCQkJCQkJPC9tYW51ZmFjdHVyZWRNYXRlcmlhbD4KCQkJCQkJCQkJPG1hbnVmYWN0dXJlck9yZ2FuaXphdGlvbj4KCQkJCQkJCQkJCTxuYW1lPkhlYWx0aCBMUyAtIEltbXVubyBJbmMuPC9uYW1lPgoJCQkJCQkJCQk8L21hbnVmYWN0dXJlck9yZ2FuaXphdGlvbj4KCQkJCQkJCQk8L21hbnVmYWN0dXJlZFByb2R1Y3Q+CgkJCQkJCQk8L2NvbnN1bWFibGU+CgkJCQkJCQk8cGVyZm9ybWVyPgoJCQkJCQkJCTxhc3NpZ25lZEVudGl0eT4KCQkJCQkJCQkJPGlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5LjUuOTk5OS40NTYiIGV4dGVuc2lvbj0iMjk4MTgyNCIvPgoJCQkJCQkJCQk8YWRkcj4KCQkJCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xMDIxIEhlYWx0aCBEcml2ZTwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQkJCQkJCQk8Y2l0eT5Bbm4gQXJib3I8L2NpdHk+CgkJCQkJCQkJCQk8c3RhdGU+TUk8L3N0YXRlPgoJCQkJCQkJCQkJPHBvc3RhbENvZGU+OTkwOTk8L3Bvc3RhbENvZGU+CgkJCQkJCQkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJCQkJCQkJPC9hZGRyPgoJCQkJCQkJCQk8dGVsZWNvbSBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPGFzc2lnbmVkUGVyc29uPgoJCQkJCQkJCQkJPG5hbWU+CgkJCQkJCQkJCQkJPGdpdmVuPkFtYW5kYTwvZ2l2ZW4+CgkJCQkJCQkJCQkJPGZhbWlseT5Bc3NpZ25lZDwvZmFtaWx5PgoJCQkJCQkJCQkJPC9uYW1lPgoJCQkJCQkJCQk8L2Fzc2lnbmVkUGVyc29uPgoJCQkJCQkJCQk8cmVwcmVzZW50ZWRPcmdhbml6YXRpb24+CgkJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNS45OTk5LjEzOTQiLz4KCQkJCQkJCQkJCTxuYW1lPkdvb2QgSGVhbHRoIENsaW5pYzwvbmFtZT4KCQkJCQkJCQkJCTx0ZWxlY29tIG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJCQkJPGFkZHIgbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCTwvcmVwcmVzZW50ZWRPcmdhbml6YXRpb24+CgkJCQkJCQkJPC9hc3NpZ25lZEVudGl0eT4KCQkJCQkJCTwvcGVyZm9ybWVyPgoJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJSU09OIj4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIEltbXVuaXphdGlvbiByZWZ1c2FsICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjUzIi8+CgkJCQkJCQkJCTxpZCByb290PSIyYTYyMDE1NS05ZDExLTQzOWUtOTJiMy01ZDk4MTVmZjRkZDgiLz4KCQkJCQkJCQkJPGNvZGUgZGlzcGxheU5hbWU9IlBhdGllbnQgT2JqZWN0aW9uIiBjb2RlPSJQQVRPQkoiCgkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iSEw3IEFjdE5vSW1tdW5pemF0aW9uUmVhc29uIgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS44Ii8+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQk8L3N1YnN0YW5jZUFkbWluaXN0cmF0aW9uPgoJCQkJCTwvZW50cnk+CgkJCQk8L3NlY3Rpb24+CgkJCTwvY29tcG9uZW50PgoJCQk8IS0tICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBJTlRFUlZFTlRJT05TICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAtLT4KCQkJPGNvbXBvbmVudD4KCQkJCTxzZWN0aW9uPgoJCQkJCTwhLS0gSW50ZXJ2ZW50aW9ucyBzZWN0aW9uIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIxLjIuMyIvPgoJCQkJCTxjb2RlIGNvZGU9IjYyMzg3LTYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIgY29kZVN5c3RlbU5hbWU9IkxPSU5DIgoJCQkJCQlkaXNwbGF5TmFtZT0iSU5URVJWRU5USU9OUyIvPgoJCQkJCTx0aXRsZT5JTlRFUlZFTlRJT05TIFBST1ZJREVEPC90aXRsZT4KCQkJCQk8dGV4dD4KCQkJCQkJPGxpc3QgbGlzdFR5cGU9Im9yZGVyZWQiPgoJCQkJCQkJPGl0ZW0+VGhlcmFwZXV0aWMgZXhlcmNpc2UgaW50ZXJ2ZW50aW9uOiBrbmVlIGV4dGVuc2lvbiwgMyBzZXRzLCAxMAoJCQkJCQkJCXJlcGV0aXRpb25zLCAxMC1sYiB3ZWlnaHQuIDwvaXRlbT4KCQkJCQkJCTxpdGVtPlRoZXJhcGV1dGljIGV4ZXJjaXNlIGludGVydmVudGlvbjogYXJtIGN1cmwsIDMgc2V0cywgMTAKCQkJCQkJCQlyZXBldGl0aW9ucywgMTUtbGIgd2VpZ2h0IDwvaXRlbT4KCQkJCQkJPC9saXN0PgoJCQkJCTwvdGV4dD4KCQkJCTwvc2VjdGlvbj4KCQkJPC9jb21wb25lbnQ+CgkJCTwhLS0gKioqKioqKioqKioqKioqKioqKioqKiogTUVESUNBTCBFUVVJUE1FTlQgKioqKioqKioqKioqKioqKioqKioqKioqKioqIC0tPgoJCQk8Y29tcG9uZW50PgoJCQkJPHNlY3Rpb24+CgkJCQkJPCEtLSBNZWRpY2FsIGVxdWlwbWVudCBzZWN0aW9uIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuMjMiLz4KCQkJCQk8Y29kZSBjb2RlPSI0NjI2NC04IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiLz4KCQkJCQk8dGl0bGU+TUVESUNBTCBFUVVJUE1FTlQ8L3RpdGxlPgoJCQkJCTx0ZXh0PgoJCQkJCQk8dGFibGUgYm9yZGVyPSIxIiB3aWR0aD0iMTAwJSI+CgkJCQkJCQk8dGhlYWQ+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGg+U3VwcGx5L0RldmljZTwvdGg+CgkJCQkJCQkJCTx0aD5EYXRlIFN1cHBsaWVkPC90aD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJPC90aGVhZD4KCQkJCQkJCTx0Ym9keT4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD5BdXRvbWF0aWMgaW1wbGFudGFibGUgY2FyZGlvdmVydGVyL2RlZmlicmlsbGF0b3I8L3RkPgoJCQkJCQkJCQk8dGQ+Tm92IDE5OTk8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+VG90YWwgaGlwIHJlcGxhY2VtZW50IHByb3N0aGVzaXM8L3RkPgoJCQkJCQkJCQk8dGQ+MTk5ODwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD5XaGVlbGNoYWlyPC90ZD4KCQkJCQkJCQkJPHRkPjE5OTk8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQk8L3Rib2R5PgoJCQkJCQk8L3RhYmxlPgoJCQkJCTwvdGV4dD4KCQkJCQk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPgoJCQkJCQk8c3VwcGx5IGNsYXNzQ29kZT0iU1BMWSIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQk8IS0tICoqIE5vbi1tZWRpY2luYWwgc3VwcGx5IGFjdGl2aXR5ICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC41MCIvPgoJCQkJCQkJPGlkIHJvb3Q9IjI0MTM3NzNjLTIzNzItNDI5OS1iYmU2LTViMGY2MDY2NDQ0NiIvPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZSB4c2k6dHlwZT0iSVZMX1RTIj4KCQkJCQkJCQk8aGlnaCB2YWx1ZT0iMTk5OTExIi8+CgkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQk8cXVhbnRpdHkgdmFsdWU9IjIiLz4KCQkJCQkJCTxwYXJ0aWNpcGFudCB0eXBlQ29kZT0iUFJEIj4KCQkJCQkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iTUFOVSI+CgkJCQkJCQkJCTwhLS0gKiogUHJvZHVjdCBpbnN0YW5jZSAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4zNyIvPgoJCQkJCQkJCQk8aWQgcm9vdD0iMjQxMzc3M2MtMjM3Mi00Mjk5LWJiZTYtNWIwZjYwNjY0NDg5Ii8+CgkJCQkJCQkJCTxwbGF5aW5nRGV2aWNlPgoJCQkJCQkJCQkJPGNvZGUgY29kZT0iNzI1MDYwMDEiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IkF1dG9tYXRpYyBpbXBsYW50YWJsZSBjYXJkaW92ZXJ0ZXIvZGVmaWJyaWxsYXRvciIKCQkJCQkJCQkJCS8+CgkJCQkJCQkJCTwvcGxheWluZ0RldmljZT4KCQkJCQkJCQkJPHNjb3BpbmdFbnRpdHk+CgkJCQkJCQkJCQk8aWQgcm9vdD0iZWI5MzYwMTAtN2IxNy0xMWRiLTlmZTEtMDgwMDIwMGM5YjY1Ii8+CgkJCQkJCQkJCTwvc2NvcGluZ0VudGl0eT4KCQkJCQkJCQk8L3BhcnRpY2lwYW50Um9sZT4KCQkJCQkJCTwvcGFydGljaXBhbnQ+CgkJCQkJCTwvc3VwcGx5PgoJCQkJCTwvZW50cnk+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPHN1cHBseSBjbGFzc0NvZGU9IlNQTFkiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBOb24tbWVkaWNpbmFsIHN1cHBseSBhY3Rpdml0eSAqKiAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNTAiLz4KCQkJCQkJCTxpZCByb290PSIyMzBiMGFiNy0yMDZkLTQyZDgtYTk0Ny1hYjRmNjNhYWQ3OTUiLz4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IklWTF9UUyI+CgkJCQkJCQkJPGNlbnRlciB2YWx1ZT0iMTk5OCIvPgoJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJPHF1YW50aXR5IHZhbHVlPSIxIi8+CgkJCQkJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IlBSRCI+CgkJCQkJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9Ik1BTlUiPgoJCQkJCQkJCQk8IS0tICoqIFByb2R1Y3QgaW5zdGFuY2UgKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMzciLz4KCQkJCQkJCQkJPGlkIHJvb3Q9ImViOTM2MDEwLTdiMTctMTFkYi05ZmUxLTA4MDAyMDBjOWE2OCIvPgoJCQkJCQkJCQk8cGxheWluZ0RldmljZT4KCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjMwNDEyMDAwNyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iVG90YWwgaGlwIHJlcGxhY2VtZW50IHByb3N0aGVzaXMiLz4KCQkJCQkJCQkJPC9wbGF5aW5nRGV2aWNlPgoJCQkJCQkJCQk8c2NvcGluZ0VudGl0eT4KCQkJCQkJCQkJCTxpZCByb290PSIwYWJlYTk1MC01YjQwLTRiN2UtYjhkOS0yYTVlYTNhYzU1MDAiLz4KCQkJCQkJCQkJCTxkZXNjPkdvb2QgSGVhbHRoIFByb3N0aGVzZXMgQ29tcGFueTwvZGVzYz4KCQkJCQkJCQkJPC9zY29waW5nRW50aXR5PgoJCQkJCQkJCTwvcGFydGljaXBhbnRSb2xlPgoJCQkJCQkJPC9wYXJ0aWNpcGFudD4KCQkJCQkJPC9zdXBwbHk+CgkJCQkJPC9lbnRyeT4KCQkJCQk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPgoJCQkJCQk8c3VwcGx5IGNsYXNzQ29kZT0iU1BMWSIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQk8IS0tICoqIE5vbi1tZWRpY2luYWwgc3VwcGx5IGFjdGl2aXR5ICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC41MCIvPgoJCQkJCQkJPGlkIHJvb3Q9ImM0ZmZlOThlLTNjZDMtNGM1NC1iNWJkLTA4ZWNiODAzNzllMCIvPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZSB4c2k6dHlwZT0iSVZMX1RTIj4KCQkJCQkJCQk8Y2VudGVyIHZhbHVlPSIxOTk5Ii8+CgkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQk8cXVhbnRpdHkgdmFsdWU9IjEiLz4KCQkJCQkJCTxwYXJ0aWNpcGFudCB0eXBlQ29kZT0iUFJEIj4KCQkJCQkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iTUFOVSI+CgkJCQkJCQkJCTwhLS0gKiogUHJvZHVjdCBpbnN0YW5jZSAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4zNyIvPgoJCQkJCQkJCQk8aWQgcm9vdD0iZWI5MzYwMTAtN2IxNy0xMWRiLTlmZTEtMDgwMDIwMGM5YTY4Ii8+CgkJCQkJCQkJCTxwbGF5aW5nRGV2aWNlPgoJCQkJCQkJCQkJPGNvZGUgY29kZT0iNTg5MzgwMDgiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IldoZWVsY2hhaXIiLz4KCQkJCQkJCQkJPC9wbGF5aW5nRGV2aWNlPgoJCQkJCQkJCQk8c2NvcGluZ0VudGl0eT4KCQkJCQkJCQkJCTxpZCByb290PSJlYjkzNjAxMC03YjE3LTExZGItOWZlMS0wODAwMjAwYzliNjciLz4KCQkJCQkJCQkJCTxkZXNjPkdvb2QgSGVhbHRoIER1cmFibGUgTWVkaWNhbCBFcXVpcG1lbnQ8L2Rlc2M+CgkJCQkJCQkJCTwvc2NvcGluZ0VudGl0eT4KCQkJCQkJCQk8L3BhcnRpY2lwYW50Um9sZT4KCQkJCQkJCTwvcGFydGljaXBhbnQ+CgkJCQkJCTwvc3VwcGx5PgoJCQkJCTwvZW50cnk+CgkJCQk8L3NlY3Rpb24+CgkJCTwvY29tcG9uZW50PgoJCQk8IS0tICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogTUVESUNBVElPTlMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogLS0+CgkJCTxjb21wb25lbnQ+CgkJCQk8c2VjdGlvbj4KCQkJCQk8IS0tIGNvbmZvcm1zIHRvIE1lZGljYXRpb25zIHNlY3Rpb24gd2l0aCBlbnRyaWVzIG9wdGlvbmFsIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuMSIvPgoJCQkJCTwhLS0gTWVkaWNhdGlvbnMgc2VjdGlvbiB3aXRoIGVudHJpZXMgcmVxdWlyZWQgLS0+CgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuMi4xLjEiLz4KCQkJCQk8Y29kZSBjb2RlPSIxMDE2MC0wIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIKCQkJCQkJZGlzcGxheU5hbWU9IkhJU1RPUlkgT0YgTUVESUNBVElPTiBVU0UiLz4KCQkJCQk8dGl0bGU+TUVESUNBVElPTlM8L3RpdGxlPgoJCQkJCTx0ZXh0PgoJCQkJCQk8dGFibGUgYm9yZGVyPSIxIiB3aWR0aD0iMTAwJSI+CgkJCQkJCQk8dGhlYWQ+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGg+TWVkaWNhdGlvbjwvdGg+CgkJCQkJCQkJCTx0aD5EaXJlY3Rpb25zPC90aD4KCQkJCQkJCQkJPHRoPlN0YXJ0IERhdGU8L3RoPgoJCQkJCQkJCQk8dGg+U3RhdHVzPC90aD4KCQkJCQkJCQkJPHRoPkluZGljYXRpb25zPC90aD4KCQkJCQkJCQkJPHRoPkZpbGwgSW5zdHJ1Y3Rpb25zPC90aD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJPC90aGVhZD4KCQkJCQkJCTx0Ym9keT4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJNZWRTZWNfMSI+UHJvdmVudGlsIEhGQQoJCQkJCQkJCQkJCTwvY29udGVudD4KCQkJCQkJCQkJPC90ZD4KCQkJCQkJCQkJPHRkPjAuMDkgTUcvQUNUVUFUIGluaGFsYW50IHNvbHV0aW9uLCAyIHB1ZmZzIFFJRCBQUk4KCQkJCQkJCQkJCXdoZWV6aW5nPC90ZD4KCQkJCQkJCQkJPHRkPjIwMDcwMTAzPC90ZD4KCQkJCQkJCQkJPHRkPkFjdGl2ZTwvdGQ+CgkJCQkJCQkJCTx0ZD5QbmV1bW9uaWEgKDIzMzYwNDAwNyBTTk9NRUQgQ1QpPC90ZD4KCQkJCQkJCQkJPHRkPkdlbmVyaWMgU3Vic3RpdGl0aW9uIEFsbG93ZWQ8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQk8L3Rib2R5PgoJCQkJCQk8L3RhYmxlPgoJCQkJCTwvdGV4dD4KCQkJCQk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPgoJCQkJCQk8c3Vic3RhbmNlQWRtaW5pc3RyYXRpb24gY2xhc3NDb2RlPSJTQkFETSIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQk8IS0tICoqIE1lZGljYXRpb24gYWN0aXZpdHkgKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjE2Ii8+CgkJCQkJCQk8aWQgcm9vdD0iY2RiZDMzZjAtNmNkZS0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQk8dGV4dD4KCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjTWVkU2VjXzEiLz4gUHJvdmVudGlsIEhGQTwvdGV4dD4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IklWTF9UUyI+CgkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwNzAxMDMiLz4KCQkJCQkJCQk8aGlnaCB2YWx1ZT0iMjAxMjA1MTUiLz4KCQkJCQkJCTwvZWZmZWN0aXZlVGltZT4KCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHhzaTp0eXBlPSJQSVZMX1RTIiBpbnN0aXR1dGlvblNwZWNpZmllZD0idHJ1ZSIKCQkJCQkJCQlvcGVyYXRvcj0iQSI+CgkJCQkJCQkJPHBlcmlvZCB2YWx1ZT0iNiIgdW5pdD0iaCIvPgoJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJPHJvdXRlQ29kZSBjb2RlPSJDMzgyMTYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjMuMjYuMS4xIgoJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJOQ0kgVGhlc2F1cnVzIgoJCQkJCQkJCWRpc3BsYXlOYW1lPSJSRVNQSVJBVE9SWSAoSU5IQUxBVElPTikiLz4KCQkJCQkJCTxkb3NlUXVhbnRpdHkgdmFsdWU9IjEiIHVuaXQ9Im1nL2FjdHVhdCIvPgoJCQkJCQkJPHJhdGVRdWFudGl0eSB2YWx1ZT0iOTAiIHVuaXQ9Im1sL21pbiIvPgoJCQkJCQkJPG1heERvc2VRdWFudGl0eSBudWxsRmxhdm9yPSJVTksiPgoJCQkJCQkJCTxudW1lcmF0b3IgbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJPGRlbm9taW5hdG9yIG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJPC9tYXhEb3NlUXVhbnRpdHk+CgkJCQkJCQk8YWRtaW5pc3RyYXRpb25Vbml0Q29kZSBjb2RlPSJDNDI5NDQiIGRpc3BsYXlOYW1lPSJJTkhBTEFOVCIKCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My4zLjI2LjEuMSIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iTkNJIFRoZXNhdXJ1cyIvPgoJCQkJCQkJPGNvbnN1bWFibGU+CgkJCQkJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3QgY2xhc3NDb2RlPSJNQU5VIj4KCQkJCQkJCQkJPCEtLSAqKiBNZWRpY2F0aW9uIGluZm9ybWF0aW9uICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjIzIi8+CgkJCQkJCQkJCTxpZCByb290PSIyYTYyMDE1NS05ZDExLTQzOWUtOTJiMy01ZDk4MTVmZjRlZTgiLz4KCQkJCQkJCQkJPG1hbnVmYWN0dXJlZE1hdGVyaWFsPgoJCQkJCQkJCQkJPGNvZGUgY29kZT0iMjE5NDgzIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljg4IgoJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJQcm92ZW50aWwgSEZBIj4KCQkJCQkJCQkJCQk8b3JpZ2luYWxUZXh0PgoJCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjTWVkU2VjXzEiLz4KCQkJCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQk8dHJhbnNsYXRpb24gY29kZT0iNTczNjIxIgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iUHJvdmVudGlsIDAuMDkgTUcvQUNUVUFUIGluaGFsYW50IHNvbHV0aW9uIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljg4IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iUnhOb3JtIi8+CgkJCQkJCQkJCQk8L2NvZGU+CgkJCQkJCQkJCTwvbWFudWZhY3R1cmVkTWF0ZXJpYWw+CgkJCQkJCQkJCTxtYW51ZmFjdHVyZXJPcmdhbml6YXRpb24+CgkJCQkJCQkJCQk8bmFtZT5NZWRpY2F0aW9uIEZhY3RvcnkgSW5jLjwvbmFtZT4KCQkJCQkJCQkJPC9tYW51ZmFjdHVyZXJPcmdhbml6YXRpb24+CgkJCQkJCQkJPC9tYW51ZmFjdHVyZWRQcm9kdWN0PgoJCQkJCQkJPC9jb25zdW1hYmxlPgoJCQkJCQkJPHBlcmZvcm1lcj4KCQkJCQkJCQk8YXNzaWduZWRFbnRpdHk+CgkJCQkJCQkJCTxpZCBudWxsRmxhdm9yPSJOSSIvPgoJCQkJCQkJCQk8YWRkciBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPHRlbGVjb20gbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCTxyZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4KCQkJCQkJCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ljk5OTkuMTM5MyIvPgoJCQkJCQkJCQkJPG5hbWU+Q29tbXVuaXR5IEhlYWx0aCBhbmQgSG9zcGl0YWxzPC9uYW1lPgoJCQkJCQkJCQkJPHRlbGVjb20gbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQk8YWRkciBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPC9yZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4KCQkJCQkJCQk8L2Fzc2lnbmVkRW50aXR5PgoJCQkJCQkJPC9wZXJmb3JtZXI+CgkJCQkJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IkNTTSI+CgkJCQkJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9Ik1BTlUiPgoJCQkJCQkJCQk8IS0tICoqIERydWcgdmVoaWNsZSAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yNCIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSI0MTIzMDcwMDkiIGRpc3BsYXlOYW1lPSJkcnVnIHZlaGljbGUiCgkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2Ii8+CgkJCQkJCQkJCTxwbGF5aW5nRW50aXR5IGNsYXNzQ29kZT0iTU1BVCI+CgkJCQkJCQkJCQk8Y29kZSBjb2RlPSIzMjQwNDkiIGRpc3BsYXlOYW1lPSJBZXJvc29sIgoJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuODgiCgkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlJ4Tm9ybSIvPgoJCQkJCQkJCQkJPG5hbWU+QWVyb3NvbDwvbmFtZT4KCQkJCQkJCQkJPC9wbGF5aW5nRW50aXR5PgoJCQkJCQkJCTwvcGFydGljaXBhbnRSb2xlPgoJCQkJCQkJPC9wYXJ0aWNpcGFudD4KCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUlNPTiI+CgkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJPCEtLSAqKiBJbmRpY2F0aW9uICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjE5Ii8+CgkJCQkJCQkJCTxpZCByb290PSJkYjczNDY0Ny1mYzk5LTQyNGMtYTg2NC03ZTNjZGE4MmU3MDMiCgkJCQkJCQkJCQlleHRlbnNpb249IjQ1NjY1Ii8+CgkJCQkJCQkJCTxjb2RlIGNvZGU9IjQwNDY4NDAwMyIgZGlzcGxheU5hbWU9IkZpbmRpbmciCgkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIvPgoJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA3MDEwMyIvPgoJCQkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjIzMzYwNDAwNyIgZGlzcGxheU5hbWU9IlBuZXVtb25pYSIKCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiLz4KCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUkVGUiI+CgkJCQkJCQkJPHN1cHBseSBjbGFzc0NvZGU9IlNQTFkiIG1vb2RDb2RlPSJJTlQiPgoJCQkJCQkJCQk8IS0tICoqIE1lZGljYXRpb24gc3VwcGx5IG9yZGVyICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjE3Ii8+CgkJCQkJCQkJCTxpZCBudWxsRmxhdm9yPSJOSSIvPgoJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IklWTF9UUyI+CgkJCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA3MDEwMyIvPgoJCQkJCQkJCQkJPGhpZ2ggbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCTwvZWZmZWN0aXZlVGltZT4KCQkJCQkJCQkJPHJlcGVhdE51bWJlciB2YWx1ZT0iMSIvPgoJCQkJCQkJCQk8cXVhbnRpdHkgdmFsdWU9Ijc1Ii8+CgkJCQkJCQkJCTxwcm9kdWN0PgoJCQkJCQkJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3QgY2xhc3NDb2RlPSJNQU5VIj4KCQkJCQkJCQkJCQk8IS0tICoqIE1lZGljYXRpb24gaW5mb3JtYXRpb24gKiogLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yMyIvPgoJCQkJCQkJCQkJCTxpZCByb290PSIyYTYyMDE1NS05ZDExLTQzOWUtOTJiMy01ZDk4MTVmZjRlZTgiLz4KCQkJCQkJCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+CgkJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjU3MzYyMSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi44OCIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlByb3ZlbnRpbCAwLjA5IE1HL0FDVFVBVCBpbmhhbGFudCBzb2x1dGlvbiI+CgkJCQkJCQkJCQkJCTxvcmlnaW5hbFRleHQ+CgkJCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNNZWRTZWNfMSIvPgoJCQkJCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQkJPHRyYW5zbGF0aW9uIGNvZGU9IjU3MzYyMSIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlByb3ZlbnRpbCAwLjA5IE1HL0FDVFVBVCBpbmhhbGFudCBzb2x1dGlvbiIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi44OCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlJ4Tm9ybSIvPgoJCQkJCQkJCQkJCQk8L2NvZGU+CgkJCQkJCQkJCQkJPC9tYW51ZmFjdHVyZWRNYXRlcmlhbD4KCQkJCQkJCQkJCQk8bWFudWZhY3R1cmVyT3JnYW5pemF0aW9uPgoJCQkJCQkJCQkJCQk8bmFtZT5NZWRpY2F0aW9uIEZhY3RvcnkgSW5jLjwvbmFtZT4KCQkJCQkJCQkJCQk8L21hbnVmYWN0dXJlck9yZ2FuaXphdGlvbj4KCQkJCQkJCQkJCTwvbWFudWZhY3R1cmVkUHJvZHVjdD4KCQkJCQkJCQkJPC9wcm9kdWN0PgoJCQkJCQkJCQk8cGVyZm9ybWVyPgoJCQkJCQkJCQkJPGFzc2lnbmVkRW50aXR5PgoJCQkJCQkJCQkJCTxpZCBleHRlbnNpb249IjI5ODE4MjMiCgkJCQkJCQkJCQkJCXJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5LjUuOTk5OS40NTYiLz4KCQkJCQkJCQkJCQk8YWRkcj4KCQkJCQkJCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjEwMDEgVmlsbGFnZQoJCQkJCQkJCQkJCQlBdmVudWU8L3N0cmVldEFkZHJlc3NMaW5lPgoJCQkJCQkJCQkJCQk8Y2l0eT5Qb3J0bGFuZDwvY2l0eT4KCQkJCQkJCQkJCQkJPHN0YXRlPk9SPC9zdGF0ZT4KCQkJCQkJCQkJCQkJPHBvc3RhbENvZGU+OTkxMjM8L3Bvc3RhbENvZGU+CgkJCQkJCQkJCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQkJCQkJCQkJCTwvYWRkcj4KCQkJCQkJCQkJCTwvYXNzaWduZWRFbnRpdHk+CgkJCQkJCQkJCTwvcGVyZm9ybWVyPgoJCQkJCQkJCQk8YXV0aG9yPgoJCQkJCQkJCQkJPHRpbWUgbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQk8YXNzaWduZWRBdXRob3I+CgkJCQkJCQkJCQkJPGlkIHJvb3Q9IjJhNjIwMTU1LTlkMTEtNDM5ZS05MmIzLTVkOTgxNWZlNGRlOCIvPgoJCQkJCQkJCQkJCTxhZGRyIG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJCQkJCTx0ZWxlY29tIG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJCQkJCTxhc3NpZ25lZFBlcnNvbj4KCQkJCQkJCQkJCQkJPG5hbWU+CgkJCQkJCQkJCQkJCTxwcmVmaXg+RHIuPC9wcmVmaXg+CgkJCQkJCQkJCQkJCTxnaXZlbj5IZW5yeTwvZ2l2ZW4+CgkJCQkJCQkJCQkJCTxmYW1pbHk+U2V2ZW48L2ZhbWlseT4KCQkJCQkJCQkJCQkJPC9uYW1lPgoJCQkJCQkJCQkJCTwvYXNzaWduZWRQZXJzb24+CgkJCQkJCQkJCQk8L2Fzc2lnbmVkQXV0aG9yPgoJCQkJCQkJCQk8L2F1dGhvcj4KCQkJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIiBpbnZlcnNpb25JbmQ9InRydWUiPgoJCQkJCQkJCQkJPGFjdCBjbGFzc0NvZGU9IkFDVCIgbW9vZENvZGU9IklOVCI+CgkJCQkJCQkJCQkJPCEtLSAqKiBJbnN0cnVjdGlvbnMgKiogLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yMCIvPgoJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjQwOTA3MzAwNyIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9Imluc3RydWN0aW9uIi8+CgkJCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNNZWRTZWNfMSIvPiBsYWJlbCBpbiBzcGFuaXNoIDwvdGV4dD4KCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCTwvYWN0PgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCTwvc3VwcGx5PgoJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUkVGUiI+CgkJCQkJCQkJPHN1cHBseSBjbGFzc0NvZGU9IlNQTFkiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIE1lZGljYXRpb24gZGlzcGVuc2UgKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMTgiLz4KCQkJCQkJCQkJPGlkIHJvb3Q9IjEuMi4zLjQuNTY3ODkuMSIKCQkJCQkJCQkJCWV4dGVuc2lvbj0iY2I3MzQ2NDctZmM5OS00MjRjLWE4NjQtN2UzY2RhODJlNzA0Ii8+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwNzAxMDMiLz4KCQkJCQkJCQkJPHJlcGVhdE51bWJlciB2YWx1ZT0iMSIvPgoJCQkJCQkJCQk8cXVhbnRpdHkgdmFsdWU9Ijc1Ii8+CgkJCQkJCQkJCTxwcm9kdWN0PgoJCQkJCQkJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3QgY2xhc3NDb2RlPSJNQU5VIj4KCQkJCQkJCQkJCQk8IS0tICoqIE1lZGljYXRpb24gaW5mb3JtYXRpb24gKiogLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yMyIvPgoJCQkJCQkJCQkJCTxpZCByb290PSIyYTYyMDE1NS05ZDExLTQzOWUtOTJiMy01ZDk4MTVmZjRlZTgiLz4KCQkJCQkJCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+CgkJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjU3MzYyMSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi44OCIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlByb3ZlbnRpbCAwLjA5IE1HL0FDVFVBVCBpbmhhbGFudCBzb2x1dGlvbiI+CgkJCQkJCQkJCQkJCTxvcmlnaW5hbFRleHQ+CgkJCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNNZWRTZWNfMSIvPgoJCQkJCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCQkJCQkJPHRyYW5zbGF0aW9uIGNvZGU9IjU3MzYyMSIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IlByb3ZlbnRpbCAwLjA5IE1HL0FDVFVBVCBpbmhhbGFudCBzb2x1dGlvbiIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi44OCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlJ4Tm9ybSIvPgoJCQkJCQkJCQkJCQk8L2NvZGU+CgkJCQkJCQkJCQkJPC9tYW51ZmFjdHVyZWRNYXRlcmlhbD4KCQkJCQkJCQkJCQk8bWFudWZhY3R1cmVyT3JnYW5pemF0aW9uPgoJCQkJCQkJCQkJCQk8bmFtZT5NZWRpY2F0aW9uIEZhY3RvcnkgSW5jLjwvbmFtZT4KCQkJCQkJCQkJCQk8L21hbnVmYWN0dXJlck9yZ2FuaXphdGlvbj4KCQkJCQkJCQkJCTwvbWFudWZhY3R1cmVkUHJvZHVjdD4KCQkJCQkJCQkJPC9wcm9kdWN0PgoJCQkJCQkJCQk8cGVyZm9ybWVyPgoJCQkJCQkJCQkJPHRpbWUgbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQk8YXNzaWduZWRFbnRpdHk+CgkJCQkJCQkJCQkJPGlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5LjUuOTk5OS40NTYiCgkJCQkJCQkJCQkJCWV4dGVuc2lvbj0iMjk4MTgyMyIvPgoJCQkJCQkJCQkJCTxhZGRyPgoJCQkJCQkJCQkJCQk8c3RyZWV0QWRkcmVzc0xpbmU+MTAwMSBWaWxsYWdlCgkJCQkJCQkJCQkJCUF2ZW51ZTwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQkJCQkJCQkJCTxjaXR5PlBvcnRsYW5kPC9jaXR5PgoJCQkJCQkJCQkJCQk8c3RhdGU+T1I8L3N0YXRlPgoJCQkJCQkJCQkJCQk8cG9zdGFsQ29kZT45OTEyMzwvcG9zdGFsQ29kZT4KCQkJCQkJCQkJCQkJPGNvdW50cnk+VVM8L2NvdW50cnk+CgkJCQkJCQkJCQkJPC9hZGRyPgoJCQkJCQkJCQkJCTx0ZWxlY29tIG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJCQkJCTxhc3NpZ25lZFBlcnNvbj4KCQkJCQkJCQkJCQkJPG5hbWU+CgkJCQkJCQkJCQkJCTxwcmVmaXg+RHIuPC9wcmVmaXg+CgkJCQkJCQkJCQkJCTxnaXZlbj5IZW5yeTwvZ2l2ZW4+CgkJCQkJCQkJCQkJCTxmYW1pbHk+U2V2ZW48L2ZhbWlseT4KCQkJCQkJCQkJCQkJPC9uYW1lPgoJCQkJCQkJCQkJCTwvYXNzaWduZWRQZXJzb24+CgkJCQkJCQkJCQkJPHJlcHJlc2VudGVkT3JnYW5pemF0aW9uPgoJCQkJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNS45OTk5LjEzOTMiLz4KCQkJCQkJCQkJCQkJPG5hbWU+Q29tbXVuaXR5IEhlYWx0aCBhbmQgSG9zcGl0YWxzPC9uYW1lPgoJCQkJCQkJCQkJCQk8dGVsZWNvbSBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJCQkJPGFkZHIgbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQkJPC9yZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4KCQkJCQkJCQkJCTwvYXNzaWduZWRFbnRpdHk+CgkJCQkJCQkJCTwvcGVyZm9ybWVyPgoJCQkJCQkJCTwvc3VwcGx5PgoJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCTxwcmVjb25kaXRpb24gdHlwZUNvZGU9IlBSQ04iPgoJCQkJCQkJCTwhLS0gKiogUHJlY29uZGl0aW9uIGZvciBzdWJzdGFuY2UgYWRtaW5pc3RyYXRpb24gKiogLS0+CgkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4yNSIvPgoJCQkJCQkJCTxjcml0ZXJpb24+CgkJCQkJCQkJCTxjb2RlIGNvZGU9IkFTU0VSVElPTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40Ii8+CgkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0UiIGNvZGU9IjU2MDE4MDA0IgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IldoZWV6aW5nIi8+CgkJCQkJCQkJPC9jcml0ZXJpb24+CgkJCQkJCQk8L3ByZWNvbmRpdGlvbj4KCQkJCQkJPC9zdWJzdGFuY2VBZG1pbmlzdHJhdGlvbj4KCQkJCQk8L2VudHJ5PgoJCQkJPC9zZWN0aW9uPgoJCQk8L2NvbXBvbmVudD4KCQkJPCEtLSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBQQVlFUlMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogLS0+CgkJCTxjb21wb25lbnQ+CgkJCQk8c2VjdGlvbj4KCQkJCQk8IS0tIFBheWVycyBzZWN0aW9uIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuMTgiLz4KCQkJCQk8Y29kZSBjb2RlPSI0ODc2OC02IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIKCQkJCQkJZGlzcGxheU5hbWU9IlBheWVyIi8+CgkJCQkJPHRpdGxlPklOU1VSQU5DRSBQUk9WSURFUlM8L3RpdGxlPgoJCQkJCTx0ZXh0PgoJCQkJCQk8dGFibGUgYm9yZGVyPSIxIiB3aWR0aD0iMTAwJSI+CgkJCQkJCQk8dGhlYWQ+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGg+UGF5ZXIgbmFtZTwvdGg+CgkJCQkJCQkJCTx0aD5Qb2xpY3kgdHlwZSAvIENvdmVyYWdlIHR5cGU8L3RoPgoJCQkJCQkJCQk8dGg+UG9saWN5IElEPC90aD4KCQkJCQkJCQkJPHRoPkNvdmVyZWQgcGFydHkgSUQ8L3RoPgoJCQkJCQkJCQk8dGg+UG9saWN5IEhvbGRlcjwvdGg+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGhlYWQ+CgkJCQkJCQk8dGJvZHk+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+R29vZCBIZWFsdGggSW5zdXJhbmNlPC90ZD4KCQkJCQkJCQkJPHRkPkV4dGVuZGVkIGhlYWx0aGNhcmUgLyBGYW1pbHk8L3RkPgoJCQkJCQkJCQk8dGQ+Q29udHJhY3QgTnVtYmVyPC90ZD4KCQkJCQkJCQkJPHRkPjExMzgzNDU8L3RkPgoJCQkJCQkJCQk8dGQ+UGF0aWVudCdzIE1vdGhlcjwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGJvZHk+CgkJCQkJCTwvdGFibGU+CgkJCQkJPC90ZXh0PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBDb3ZlcmFnZSBhY3Rpdml0eSAqKiAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNjAiLz4KCQkJCQkJCTxpZCByb290PSIxZmUyY2RkMC03YWFkLTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4KCQkJCQkJCTxjb2RlIGNvZGU9IjQ4NzY4LTYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iTE9JTkMiIGRpc3BsYXlOYW1lPSJQYXltZW50IHNvdXJjZXMiLz4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJDT01QIj4KCQkJCQkJCQk8YWN0IGNsYXNzQ29kZT0iQUNUIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJPCEtLSAqKiBQb2xpY3kgYWN0aXZpdHkgKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNjEiLz4KCQkJCQkJCQkJPGlkIHJvb3Q9IjNlNjc2YTUwLTdhYWMtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSJTRUxGIiBjb2RlU3lzdGVtTmFtZT0iSEw3IFJvbGVDbGFzc1JlbGF0aW9uc2hpcCIKCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuMTEwIi8+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8IS0tIEluc3VyYW5jZSBDb21wYW55IEluZm9ybWF0aW9uIC0tPgoJCQkJCQkJCQk8cGVyZm9ybWVyIHR5cGVDb2RlPSJQUkYiPgoJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC44NyIvPgoJCQkJCQkJCQkJPHRpbWU+CgkJCQkJCQkJCQkJPGxvdyBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJCQk8aGlnaCBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJCTwvdGltZT4KCQkJCQkJCQkJCTxhc3NpZ25lZEVudGl0eT4KCQkJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkiLz4KCQkJCQkJCQkJCQk8Y29kZSBjb2RlPSJQQVlPUiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS4xMTAiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJITDcgUm9sZUNvZGUiLz4KCQkJCQkJCQkJCQk8YWRkciB1c2U9IldQIj4KCQkJCQkJCQkJCQkJPCEtLSBIUCBpcyAicHJpbWFyeSBob21lIiBmcm9tIGNvZGVTeXN0ZW0gMi4xNi44NDAuMS4xMTM4ODMuNS4xMTE5IC0tPgoJCQkJCQkJCQkJCQk8c3RyZWV0QWRkcmVzc0xpbmU+MTIzIEluc3VyYW5jZQoJCQkJCQkJCQkJCQlSb2FkPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCQkJPGNpdHk+Qmx1ZSBCZWxsPC9jaXR5PgoJCQkJCQkJCQkJCQk8c3RhdGU+TUE8L3N0YXRlPgoJCQkJCQkJCQkJCQk8cG9zdGFsQ29kZT4wMjM2ODwvcG9zdGFsQ29kZT4KCQkJCQkJCQkJCQkJPGNvdW50cnk+VVM8L2NvdW50cnk+CgkJCQkJCQkJCQkJCTwhLS0gVVMgaXMgIlVuaXRlZCBTdGF0ZXMiIGZyb20gSVNPIDMxNjYtMSBDb3VudHJ5IENvZGVzOiAxLjAuMzE2Ni4xIC0tPgoJCQkJCQkJCQkJCTwvYWRkcj4KCQkJCQkJCQkJCQk8dGVsZWNvbSB2YWx1ZT0idGVsOig3ODEpNTU1LTE1MTUiIHVzZT0iV1AiLz4KCQkJCQkJCQkJCQk8cmVwcmVzZW50ZWRPcmdhbml6YXRpb24+CgkJCQkJCQkJCQkJCTxuYW1lPkdvb2QgSGVhbHRoIEluc3VyYW5jZTwvbmFtZT4KCQkJCQkJCQkJCQkJPHRlbGVjb20gdmFsdWU9InRlbDooNzgxKTU1NS0xNTE1IiB1c2U9IldQIi8+CgkJCQkJCQkJCQkJCTxhZGRyIHVzZT0iV1AiPgoJCQkJCQkJCQkJCQk8IS0tIEhQIGlzICJwcmltYXJ5IGhvbWUiIGZyb20gY29kZVN5c3RlbSAyLjE2Ljg0MC4xLjExMzg4My41LjExMTkgLS0+CgkJCQkJCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xMjMgSW5zdXJhbmNlCgkJCQkJCQkJCQkJCVJvYWQ8L3N0cmVldEFkZHJlc3NMaW5lPgoJCQkJCQkJCQkJCQk8Y2l0eT5CbHVlIEJlbGw8L2NpdHk+CgkJCQkJCQkJCQkJCTxzdGF0ZT5NQTwvc3RhdGU+CgkJCQkJCQkJCQkJCTxwb3N0YWxDb2RlPjAyMzY4PC9wb3N0YWxDb2RlPgoJCQkJCQkJCQkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJCQkJCQkJCQkJPCEtLSBVUyBpcyAiVW5pdGVkIFN0YXRlcyIgZnJvbSBJU08gMzE2Ni0xIENvdW50cnkgQ29kZXM6IDEuMC4zMTY2LjEgLS0+CgkJCQkJCQkJCQkJCTwvYWRkcj4KCQkJCQkJCQkJCQk8L3JlcHJlc2VudGVkT3JnYW5pemF0aW9uPgoJCQkJCQkJCQkJPC9hc3NpZ25lZEVudGl0eT4KCQkJCQkJCQkJPC9wZXJmb3JtZXI+CgkJCQkJCQkJCTwhLS0gR3VhcmFudG9yIEluZm9ybWF0aW9uLi4uIFRoZSBwZXJzb24gcmVzcG9uc2libGUgZm9yIHRoZSBmaW5hbCBiaWxsLiAtLT4KCQkJCQkJCQkJPHBlcmZvcm1lciB0eXBlQ29kZT0iUFJGIj4KCQkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuODgiLz4KCQkJCQkJCQkJCTx0aW1lPgoJCQkJCQkJCQkJCTxsb3cgbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQkJPGhpZ2ggbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQk8L3RpbWU+CgkJCQkJCQkJCQk8YXNzaWduZWRFbnRpdHk+CgkJCQkJCQkJCQkJPGlkIHJvb3Q9IjMyOWZjZGYwLTdhYjMtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IkdVQVIiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuMTExIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iSEw3IFJvbGVDb2RlIi8+CgkJCQkJCQkJCQkJPGFkZHIgdXNlPSJIUCI+CgkJCQkJCQkJCQkJCTwhLS0gSFAgaXMgInByaW1hcnkgaG9tZSIgZnJvbSBjb2RlU3lzdGVtIDIuMTYuODQwLjEuMTEzODgzLjUuMTExOSAtLT4KCQkJCQkJCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjE3IERhd3MgUmQuPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCQkJPGNpdHk+Qmx1ZSBCZWxsPC9jaXR5PgoJCQkJCQkJCQkJCQk8c3RhdGU+TUE8L3N0YXRlPgoJCQkJCQkJCQkJCQk8cG9zdGFsQ29kZT4wMjM2ODwvcG9zdGFsQ29kZT4KCQkJCQkJCQkJCQkJPGNvdW50cnk+VVM8L2NvdW50cnk+CgkJCQkJCQkJCQkJCTwhLS0gVVMgaXMgIlVuaXRlZCBTdGF0ZXMiIGZyb20gSVNPIDMxNjYtMSBDb3VudHJ5IENvZGVzOiAxLjAuMzE2Ni4xIC0tPgoJCQkJCQkJCQkJCTwvYWRkcj4KCQkJCQkJCQkJCQk8dGVsZWNvbSB2YWx1ZT0idGVsOig3ODEpNTU1LTEyMTIiIHVzZT0iSFAiLz4KCQkJCQkJCQkJCQk8YXNzaWduZWRQZXJzb24+CgkJCQkJCQkJCQkJCTxuYW1lPgoJCQkJCQkJCQkJCQk8cHJlZml4Pk1yLjwvcHJlZml4PgoJCQkJCQkJCQkJCQk8Z2l2ZW4+QWRhbTwvZ2l2ZW4+CgkJCQkJCQkJCQkJCTxnaXZlbj5GcmFua2llPC9naXZlbj4KCQkJCQkJCQkJCQkJPGZhbWlseT5FdmVyeW1hbjwvZmFtaWx5PgoJCQkJCQkJCQkJCQk8L25hbWU+CgkJCQkJCQkJCQkJPC9hc3NpZ25lZFBlcnNvbj4KCQkJCQkJCQkJCTwvYXNzaWduZWRFbnRpdHk+CgkJCQkJCQkJCTwvcGVyZm9ybWVyPgoJCQkJCQkJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IkNPViI+CgkJCQkJCQkJCQk8IS0tIENvdmVyZWQgUGFydHkgUGFydGljaXBhbnQgLS0+CgkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40Ljg5Ii8+CgkJCQkJCQkJCQk8dGltZT4KCQkJCQkJCQkJCQk8bG93IG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJCQkJCTxoaWdoIG51bGxGbGF2b3I9IlVOSyIvPgoJCQkJCQkJCQkJPC90aW1lPgoJCQkJCQkJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9IlBBVCI+CgkJCQkJCQkJCQkJPCEtLSBIZWFsdGggcGxhbiBJRCBmb3IgcGF0aWVudC4gLS0+CgkJCQkJCQkJCQkJPGlkIHJvb3Q9IjE0ZDRhNTIwLTdhYWUtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIKCQkJCQkJCQkJCQkJZXh0ZW5zaW9uPSIxMTM4MzQ1Ii8+CgkJCQkJCQkJCQkJPGNvZGUgY29kZT0iU0VMRiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS4xMTEiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJTZWxmIi8+CgkJCQkJCQkJCQkJPGFkZHIgdXNlPSJIUCI+CgkJCQkJCQkJCQkJCTwhLS0gSFAgaXMgInByaW1hcnkgaG9tZSIgZnJvbSBjb2RlU3lzdGVtIDIuMTYuODQwLjEuMTEzODgzLjUuMTExOSAtLT4KCQkJCQkJCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjE3IERhd3MgUmQuPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCQkJPGNpdHk+Qmx1ZSBCZWxsPC9jaXR5PgoJCQkJCQkJCQkJCQk8c3RhdGU+TUE8L3N0YXRlPgoJCQkJCQkJCQkJCQk8cG9zdGFsQ29kZT4wMjM2ODwvcG9zdGFsQ29kZT4KCQkJCQkJCQkJCQkJPGNvdW50cnk+VVM8L2NvdW50cnk+CgkJCQkJCQkJCQkJCTwhLS0gVVMgaXMgIlVuaXRlZCBTdGF0ZXMiIGZyb20gSVNPIDMxNjYtMSBDb3VudHJ5IENvZGVzOiAxLjAuMzE2Ni4xIC0tPgoJCQkJCQkJCQkJCTwvYWRkcj4KCQkJCQkJCQkJCQk8cGxheWluZ0VudGl0eT4KCQkJCQkJCQkJCQkJPG5hbWU+CgkJCQkJCQkJCQkJCTwhLS0gTmFtZSBpcyBuZWVkZWQgaWYgZGlmZmVyZW50IHRoYW4gaGVhbHRoIHBsYW4gbmFtZS4gLS0+CgkJCQkJCQkJCQkJCTxwcmVmaXg+TXIuPC9wcmVmaXg+CgkJCQkJCQkJCQkJCTxnaXZlbj5GcmFuazwvZ2l2ZW4+CgkJCQkJCQkJCQkJCTxnaXZlbj5BLjwvZ2l2ZW4+CgkJCQkJCQkJCQkJCTxmYW1pbHk+RXZlcnltYW48L2ZhbWlseT4KCQkJCQkJCQkJCQkJPC9uYW1lPgoJCQkJCQkJCQkJCTwvcGxheWluZ0VudGl0eT4KCQkJCQkJCQkJCTwvcGFydGljaXBhbnRSb2xlPgoJCQkJCQkJCQk8L3BhcnRpY2lwYW50PgoJCQkJCQkJCQk8IS0tIFBvbGljeSBIb2xkZXIgLS0+CgkJCQkJCQkJCTxwYXJ0aWNpcGFudCB0eXBlQ29kZT0iSExEIj4KCQkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuOTAiLz4KCQkJCQkJCQkJCTxwYXJ0aWNpcGFudFJvbGU+CgkJCQkJCQkJCQkJPGlkIGV4dGVuc2lvbj0iMTEzODM0NSIgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkiLz4KCQkJCQkJCQkJCQk8YWRkciB1c2U9IkhQIj4KCQkJCQkJCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjE3IERhd3MgUmQuPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCQkJPGNpdHk+Qmx1ZSBCZWxsPC9jaXR5PgoJCQkJCQkJCQkJCQk8c3RhdGU+TUE8L3N0YXRlPgoJCQkJCQkJCQkJCQk8cG9zdGFsQ29kZT4wMjM2ODwvcG9zdGFsQ29kZT4KCQkJCQkJCQkJCQkJPGNvdW50cnk+VVM8L2NvdW50cnk+CgkJCQkJCQkJCQkJPC9hZGRyPgoJCQkJCQkJCQkJPC9wYXJ0aWNpcGFudFJvbGU+CgkJCQkJCQkJCTwvcGFydGljaXBhbnQ+CgkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUkVGUiI+CgkJCQkJCQkJCQk8YWN0IGNsYXNzQ29kZT0iQUNUIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJCQk8IS0tICoqIEF1dGhvcml6YXRpb24gYWN0aXZpdHkgKiogLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4xOSIvPgoJCQkJCQkJCQkJCTxpZCByb290PSJmNGRjZTc5MC04MzI4LTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4KCQkJCQkJCQkJCQk8Y29kZSBudWxsRmxhdm9yPSJOQSIvPgoJCQkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiI+CgkJCQkJCQkJCQkJCTxwcm9jZWR1cmUgY2xhc3NDb2RlPSJQUk9DIiBtb29kQ29kZT0iUFJNUyI+CgkJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjczNzYxMDAxIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIENUIgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iQ29sb25vc2NvcHkiLz4KCQkJCQkJCQkJCQkJPC9wcm9jZWR1cmU+CgkJCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQkJCTwvYWN0PgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCQk8IS0tIFRoZSBhYm92ZSBlbnRyeVJlbGF0aW9uc2hpcCBPUiB0aGUgZm9sbG93aW5nLiA8ZW50cnlSZWxhdGlvbnNoaXAgCgkJCQkJCQkJCQl0eXBlQ29kZT0iUkVGUiI+IDxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJERUYiPiA8aWQgcm9vdD0iZjRkY2U3OTAtODMyOC0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2Ii8+IAoJCQkJCQkJCQkJPGNvZGUgbnVsbEZsYXZvcj0iVU5LIi8+IDx0ZXh0PkhlYWx0aCBQbGFuIE5hbWU8cmVmZXJlbmNlIHZhbHVlPSJQbnRyVG9IZWFsdGhQbGFuTmFtZUluU2VjdGlvblRleHQiLz4gCgkJCQkJCQkJCQk8L3RleHQ+IDxzdGF0dXNDb2RlIGNvZGU9ImFjdGl2ZSIvPiA8L2FjdD4gPC9lbnRyeVJlbGF0aW9uc2hpcD4gLS0+CgkJCQkJCQkJPC9hY3Q+CgkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQk8L2FjdD4KCQkJCQk8L2VudHJ5PgoJCQkJPC9zZWN0aW9uPgoJCQk8L2NvbXBvbmVudD4KCQkJPCEtLSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBQTEFOIE9GIENBUkUgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogLS0+CgkJCTxjb21wb25lbnQ+CgkJCQk8c2VjdGlvbj4KCQkJCQk8IS0tIFBsYW4gb2YgY2FyZSBzZWN0aW9uIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuMTAiLz4KCQkJCQk8Y29kZSBjb2RlPSIxODc3Ni01IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIKCQkJCQkJZGlzcGxheU5hbWU9IlRyZWF0bWVudCBwbGFuIi8+CgkJCQkJPHRpdGxlPlBMQU4gT0YgQ0FSRTwvdGl0bGU+CgkJCQkJPHRleHQ+CgkJCQkJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4KCQkJCQkJCTx0aGVhZD4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aD5QbGFubmVkIEFjdGl2aXR5PC90aD4KCQkJCQkJCQkJPHRoPlBsYW5uZWQgRGF0ZTwvdGg+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGhlYWQ+CgkJCQkJCQk8dGJvZHk+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+Q29sb25vc2NvcHk8L3RkPgoJCQkJCQkJCQk8dGQ+MjAxMjA1MTI8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQk8L3Rib2R5PgoJCQkJCQk8L3RhYmxlPgoJCQkJCTwvdGV4dD4KCQkJCQk8IS0tIEV4YW1wbGVzIG9mIHRoZSBzYW1lIHBsYW5uZWQgYWN0aXZpdHkgYXJlIHNob3duIGluIGRpZmZlcmVudCBwbGFuIG9mIGNhcmUgZW50cmllcyAtLT4KCQkJCQk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPgoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJSUU8iPgoJCQkJCQkJPCEtLSAqKiBQbGFuIG9mIGNhcmUgYWN0aXZpdHkgb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjQ0Ii8+CgkJCQkJCQk8aWQgcm9vdD0iOWE2ZDFiYWMtMTdkMy00MTk1LTg5YTQtMTEyMWJjODA5YjRhIi8+CgkJCQkJCQk8Y29kZSBjb2RlPSI3Mzc2MTAwMSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIENUIiBkaXNwbGF5TmFtZT0iQ29sb25vc2NvcHkiLz4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9Im5ldyIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJPGNlbnRlciB2YWx1ZT0iMjAxMjA1MTIiLz4KCQkJCQkJCTwvZWZmZWN0aXZlVGltZT4KCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQk8L2VudHJ5PgoJCQkJCTxlbnRyeT4KCQkJCQkJPGFjdCBtb29kQ29kZT0iUlFPIiBjbGFzc0NvZGU9IkFDVCI+CgkJCQkJCQk8IS0tICoqIFBsYW4gb2YgY2FyZSBhY3Rpdml0eSBhY3QgKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjM5Ii8+CgkJCQkJCQk8aWQgcm9vdD0iOWE2ZDFiYWMtMTdkMy00MTk1LTg5YTQtMTEyMWJjODA5YTVjIi8+CgkJCQkJCQk8Y29kZSBjb2RlPSI3Mzc2MTAwMSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIENUIiBkaXNwbGF5TmFtZT0iQ29sb25vc2NvcHkiLz4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9Im5ldyIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJPGNlbnRlciB2YWx1ZT0iMjAxMjA1MTIiLz4KCQkJCQkJCTwvZWZmZWN0aXZlVGltZT4KCQkJCQkJPC9hY3Q+CgkJCQkJPC9lbnRyeT4KCQkJCQk8ZW50cnk+CgkJCQkJCTxlbmNvdW50ZXIgbW9vZENvZGU9IklOVCIgY2xhc3NDb2RlPSJFTkMiPgoJCQkJCQkJPCEtLSAqKiBQbGFuIG9mIGNhcmUgYWN0aXZpdHkgZW5jb3VudGVyICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC40MCIvPgoJCQkJCQkJPGlkIHJvb3Q9IjlhNmQxYmFjLTE3ZDMtNDE5NS04OWE0LTExMjFiYzgwOWI0ZCIvPgoJCQkJCQkJPGNvZGUgY29kZT0iNzM3NjEwMDEiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIgZGlzcGxheU5hbWU9IkNvbG9ub3Njb3B5Ii8+CgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJuZXciLz4KCQkJCQkJCTxlZmZlY3RpdmVUaW1lPgoJCQkJCQkJCTxjZW50ZXIgdmFsdWU9IjIwMTIwNTEyIi8+CgkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCTwvZW5jb3VudGVyPgoJCQkJCTwvZW50cnk+CgkJCQkJPGVudHJ5PgoJCQkJCQk8cHJvY2VkdXJlIG1vb2RDb2RlPSJSUU8iIGNsYXNzQ29kZT0iUFJPQyI+CgkJCQkJCQk8IS0tICoqIFBsYW4gb2YgY2FyZSBhY3Rpdml0eSBwcm9jZWR1cmUgKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjQxIi8+CgkJCQkJCQk8aWQgcm9vdD0iOWE2ZDFiYWMtMTdkMy00MTk1LTg5YzQtMTEyMWJjODA5YjVhIi8+CgkJCQkJCQk8Y29kZSBjb2RlPSI3Mzc2MTAwMSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIENUIiBkaXNwbGF5TmFtZT0iQ29sb25vc2NvcHkiLz4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9Im5ldyIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJPGNlbnRlciB2YWx1ZT0iMjAxMjA1MTIiLz4KCQkJCQkJCTwvZWZmZWN0aXZlVGltZT4KCQkJCQkJPC9wcm9jZWR1cmU+CgkJCQkJPC9lbnRyeT4KCQkJCTwvc2VjdGlvbj4KCQkJPC9jb21wb25lbnQ+CgkJCTwhLS0gKioqKioqKioqKioqKioqKioqKioqKioqKiBQUk9CTEVNIExJU1QgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC0tPgoJCQk8Y29tcG9uZW50PgoJCQkJPHNlY3Rpb24+CgkJCQkJPCEtLSBjb25mb3JtcyB0byBQcm9ibGVtcyBzZWN0aW9uIHdpdGggZW50cmllcyBvcHRpb25hbCAtLT4KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi4yLjUiLz4KCQkJCQk8IS0tIFByb2JsZW1zIHNlY3Rpb24gd2l0aCBlbnRyaWVzIHJlcXVpcmVkIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuNS4xIi8+CgkJCQkJPGNvZGUgY29kZT0iMTE0NTAtNCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBjb2RlU3lzdGVtTmFtZT0iTE9JTkMiCgkJCQkJCWRpc3BsYXlOYW1lPSJQUk9CTEVNIExJU1QiLz4KCQkJCQk8dGl0bGU+UFJPQkxFTVM8L3RpdGxlPgoJCQkJCTx0ZXh0PgoJCQkJCQk8Y29udGVudCBJRD0icHJvYmxlbXMiLz4KCQkJCQkJPGxpc3QgbGlzdFR5cGU9Im9yZGVyZWQiPgoJCQkJCQkJPGl0ZW0+CgkJCQkJCQkJPGNvbnRlbnQgSUQ9InByb2JsZW0xIj5QbmV1bW9uaWEgPC9jb250ZW50PgoJCQkJCQkJCTxjb250ZW50IElEPSJzdGF0MSI+U3RhdHVzOiBSZXNvbHZlZDwvY29udGVudD4KCQkJCQkJCTwvaXRlbT4KCQkJCQkJCTxpdGVtPgoJCQkJCQkJCTxjb250ZW50IElEPSJwcm9ibGVtMiI+QXN0aG1hPC9jb250ZW50PgoJCQkJCQkJCTxjb250ZW50IElEPSJzdGF0MiI+U3RhdHVzOiBBY3RpdmU8L2NvbnRlbnQ+CgkJCQkJCQk8L2l0ZW0+CgkJCQkJCTwvbGlzdD4KCQkJCQk8L3RleHQ+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPGFjdCBjbGFzc0NvZGU9IkFDVCIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQk8IS0tICoqIFByb2JsZW0gY29uY2VybiBhY3QgKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjMiLz4KCQkJCQkJCTxpZCByb290PSJlYzhhNmZmOC1lZDRiLTRmN2UtODJjMy1lOThlNThiNDVkZTciLz4KCQkJCQkJCTxjb2RlIGNvZGU9IkNPTkMiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNiIKCQkJCQkJCQlkaXNwbGF5TmFtZT0iQ29uY2VybiIvPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA4MDEwMyIvPgoJCQkJCQkJCTxoaWdoIHZhbHVlPSIyMDA4MDEwMyIvPgoJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIj4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIFByb2JsZW0gb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNCIvPgoJCQkJCQkJCQk8aWQgcm9vdD0iYWIxNzkxYjAtNWM3MS0xMWRiLWIwZGUtMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQkJCTxjb2RlIGNvZGU9IjQwOTU4NjAwNiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJDb21wbGFpbnQiLz4KCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjcHJvYmxlbTEiLz4KCQkJCQkJCQkJPC90ZXh0PgoJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA4MDEwMyIvPgoJCQkJCQkJCQkJPGhpZ2ggdmFsdWU9IjIwMDgwMTAzIi8+CgkJCQkJCQkJCTwvZWZmZWN0aXZlVGltZT4KCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iMjMzNjA0MDA3IgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IlBuZXVtb25pYSIvPgoJCQkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlJFRlIiPgoJCQkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJCQk8IS0tICoqIFByb2JsZW0gc3RhdHVzIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNiIvPgoJCQkJCQkJCQkJCTxpZCByb290PSJhYjE3OTFiMC01YzcxLTExZGItYjBkZS0wODAwMjAwYzlhNjYiLz4KCQkJCQkJCQkJCQk8Y29kZSBjb2RlPSIzMzk5OS00IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJTdGF0dXMiLz4KCQkJCQkJCQkJCQk8dGV4dD4KCQkJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI1NUQVQxIi8+CgkJCQkJCQkJCQkJPC90ZXh0PgoJCQkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lPgoJCQkJCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA4MDEwMyIvPgoJCQkJCQkJCQkJCQk8aGlnaCB2YWx1ZT0iMjAwOTAyMjcxMzAwMDArMDUwMCIvPgoJCQkJCQkJCQkJCTwvZWZmZWN0aXZlVGltZT4KCQkJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSI0MTMzMjIwMDkiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJSZXNvbHZlZCIvPgoJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIiBpbnZlcnNpb25JbmQ9InRydWUiPgoJCQkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJCQk8IS0tIEFnZSBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjMxIi8+CgkJCQkJCQkJCQkJPGNvZGUgY29kZT0iNDQ1NTE4MDA4IgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iQWdlIEF0IE9uc2V0Ii8+CgkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9IjU3IiB1bml0PSJhIi8+CgkJCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlJFRlIiPgoJCQkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJCQk8IS0tIEhlYWx0aCBzdGF0dXMgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC41Ii8+CgkJCQkJCQkJCQkJPGNvZGUgY29kZT0iMTEzMjMtMyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIgoJCQkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iTE9JTkMiIGRpc3BsYXlOYW1lPSJIZWFsdGggc3RhdHVzIi8+CgkJCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNwcm9ibGVtcyIvPgoJCQkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSI4MTMyMzAwNCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IkFsaXZlIGFuZCB3ZWxsIi8+CgkJCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPgoJCQkJCQk8L2FjdD4KCQkJCQk8L2VudHJ5PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSBQcm9ibGVtIGNvbmNlcm4gYWN0ICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4zIi8+CgkJCQkJCQk8aWQgcm9vdD0iZWM4YTZmZjgtZWQ0Yi00ZjdlLTgyYzMtZTk4ZTU4YjQ1ZGU3Ii8+CgkJCQkJCQk8Y29kZSBjb2RlPSJDT05DIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjYiCgkJCQkJCQkJZGlzcGxheU5hbWU9IkNvbmNlcm4iLz4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwNzAxMDMiLz4KCQkJCQkJCQk8aGlnaCB2YWx1ZT0iMjAwNzAxMDMiLz4KCQkJCQkJCTwvZWZmZWN0aXZlVGltZT4KCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiI+CgkJCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCQkJPCEtLSAqKiBQcm9ibGVtIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjQiLz4KCQkJCQkJCQkJPGlkIHJvb3Q9ImFiMTc5MWIwLTVjNzEtMTFkYi1iMGRlLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSI0MDk1ODYwMDYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iQ29tcGxhaW50Ii8+CgkJCQkJCQkJCTx0ZXh0PgoJCQkJCQkJCQkJPHJlZmVyZW5jZSB2YWx1ZT0iI3Byb2JsZW0yIi8+CgkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lPgoJCQkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwNzAxMDMiLz4KCQkJCQkJCQkJCTxoaWdoIHZhbHVlPSIyMDA4MDEwMyIvPgoJCQkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjE5NTk2NzAwMSIKCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJBc3RobWEiLz4KCQkJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJSRUZSIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBQcm9ibGVtIHN0YXR1cyBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjYiLz4KCQkJCQkJCQkJCQk8aWQgcm9vdD0iYWIxNzkxYjAtNWM3MS0xMWRiLWIwZGUtMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQkJCQkJPGNvZGUgY29kZT0iMzM5OTktNCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIgoJCQkJCQkJCQkJCQlkaXNwbGF5TmFtZT0iU3RhdHVzIi8+CgkJCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNTVEFUMiIvPgoJCQkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQkJCQkJPGxvdyB2YWx1ZT0iMjAwODAxMDMiLz4KCQkJCQkJCQkJCQkJPGhpZ2ggdmFsdWU9IjIwMDkwMjI3MTMwMDAwKzA1MDAiLz4KCQkJCQkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNTU1NjEwMDMiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJBY3RpdmUiLz4KCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+CgkJCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBBZ2Ugb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4zMSIvPgoJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjQ0NTUxODAwOCIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IkFnZSBBdCBPbnNldCIvPgoJCQkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSI1NyIgdW5pdD0iYSIvPgoJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJSRUZSIj4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCQkJPCEtLSAqKiBIZWFsdGggc3RhdHVzIG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuNSIvPgoJCQkJCQkJCQkJCTxjb2RlIGNvZGU9IjExMzIzLTMiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkxPSU5DIiBkaXNwbGF5TmFtZT0iSGVhbHRoIHN0YXR1cyIvPgoJCQkJCQkJCQkJCTx0ZXh0PgoJCQkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjcHJvYmxlbXMiLz4KCQkJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iODEzMjMwMDQiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiCgkJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJBbGl2ZSBhbmQgd2VsbCIvPgoJCQkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4KCQkJCQkJPC9hY3Q+CgkJCQkJPC9lbnRyeT4KCQkJCTwvc2VjdGlvbj4KCQkJPC9jb21wb25lbnQ+CgkJCTwhLS0gKioqKioqKioqKioqKioqKioqKioqKioqKiogUFJPQ0VEVVJFUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC0tPgoJCQk8Y29tcG9uZW50PgoJCQkJPHNlY3Rpb24+CgkJCQkJPCEtLSBjb25mb3JtcyB0byBQcm9jZWR1cmVzIHNlY3Rpb24gd2l0aCBlbnRyaWVzIG9wdGlvbmFsIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuNyIvPgoJCQkJCTwhLS0gUHJvY2VkdXJlcyBzZWN0aW9uIHdpdGggZW50cmllcyByZXF1aXJlZCAtLT4KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi4yLjcuMSIvPgoJCQkJCTxjb2RlIGNvZGU9IjQ3NTE5LTQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIgY29kZVN5c3RlbU5hbWU9IkxPSU5DIgoJCQkJCQlkaXNwbGF5TmFtZT0iSElTVE9SWSBPRiBQUk9DRURVUkVTIi8+CgkJCQkJPHRpdGxlPlBST0NFRFVSRVM8L3RpdGxlPgoJCQkJCTx0ZXh0PgoJCQkJCQk8dGFibGUgYm9yZGVyPSIxIiB3aWR0aD0iMTAwJSI+CgkJCQkJCQk8dGhlYWQ+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGg+UHJvY2VkdXJlPC90aD4KCQkJCQkJCQkJPHRoPkRhdGU8L3RoPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQk8L3RoZWFkPgoJCQkJCQkJPHRib2R5PgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9IlByb2MxIj5Db2xvbmljIHBvbHlwZWN0b215PC9jb250ZW50PgoJCQkJCQkJCQk8L3RkPgoJCQkJCQkJCQk8dGQ+MTk5ODwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGJvZHk+CgkJCQkJCTwvdGFibGU+CgkJCQkJPC90ZXh0PgoJCQkJCTwhLS0gRXhhbXBsZXMgb2YgdGhlIHNhbWUgcHJvY2VkdXJlIGFyZSBzaG93biBpbiBkaWZmZXJlbnQgcHJvY2VkdXJlIGVudHJpZXMgLS0+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPHByb2NlZHVyZSBjbGFzc0NvZGU9IlBST0MiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBQcm9jZWR1cmUgYWN0aXZpdHkgcHJvY2VkdXJlICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4xNCIvPgoJCQkJCQkJPGlkIHJvb3Q9ImQ2OGI3ZTMyLTc4MTAtNGY1Yi05Y2MyLWFjZDU0YjBmZDg1ZCIvPgoJCQkJCQkJPGNvZGUgY29kZT0iNzM3NjEwMDEiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIgZGlzcGxheU5hbWU9IkNvbG9ub3Njb3B5Ij4KCQkJCQkJCQk8b3JpZ2luYWxUZXh0PgoJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjUHJvYzEiLz4KCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCTwvY29kZT4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMTIwNTEyIi8+CgkJCQkJCQk8bWV0aG9kQ29kZSBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCTx0YXJnZXRTaXRlQ29kZSBjb2RlPSJhcHByb3ByaWF0ZV9jb2RlIiBkaXNwbGF5TmFtZT0iY29sb24iCgkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuMy44OC4xMi4zMjIxLjguOSIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iQm9keSBTaXRlIFZhbHVlIFNldCIvPgoJCQkJCQkJPHNwZWNpbWVuIHR5cGVDb2RlPSJTUEMiPgoJCQkJCQkJCTxzcGVjaW1lblJvbGUgY2xhc3NDb2RlPSJTUEVDIj4KCQkJCQkJCQkJPGlkIHJvb3Q9ImMyZWU5ZWU5LWFlMzEtNDYyOC1hOTE5LWZlYzFjYmI1ODY4MyIvPgoJCQkJCQkJCQk8c3BlY2ltZW5QbGF5aW5nRW50aXR5PgoJCQkJCQkJCQkJPGNvZGUgY29kZT0iMzA5MjI2MDA1IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJjb2xvbmljIHBvbHlwIHNhbXBsZSIvPgoJCQkJCQkJCQk8L3NwZWNpbWVuUGxheWluZ0VudGl0eT4KCQkJCQkJCQk8L3NwZWNpbWVuUm9sZT4KCQkJCQkJCTwvc3BlY2ltZW4+CgkJCQkJCQk8cGVyZm9ybWVyPgoJCQkJCQkJCTxhc3NpZ25lZEVudGl0eT4KCQkJCQkJCQkJPGlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5LjUuOTk5OS40NTYiIGV4dGVuc2lvbj0iMjk4MTgyMyIvPgoJCQkJCQkJCQk8YWRkcj4KCQkJCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xMDAxIFZpbGxhZ2UgQXZlbnVlPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCTxjaXR5PlBvcnRsYW5kPC9jaXR5PgoJCQkJCQkJCQkJPHN0YXRlPk9SPC9zdGF0ZT4KCQkJCQkJCQkJCTxwb3N0YWxDb2RlPjk5MTIzPC9wb3N0YWxDb2RlPgoJCQkJCQkJCQkJPGNvdW50cnk+VVM8L2NvdW50cnk+CgkJCQkJCQkJCTwvYWRkcj4KCQkJCQkJCQkJPHRlbGVjb20gdXNlPSJXUCIgdmFsdWU9IjU1NS01NTUtNTAwMCIvPgoJCQkJCQkJCQk8cmVwcmVzZW50ZWRPcmdhbml6YXRpb24+CgkJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNS45OTk5LjEzOTMiLz4KCQkJCQkJCQkJCTxuYW1lPkNvbW11bml0eSBIZWFsdGggYW5kIEhvc3BpdGFsczwvbmFtZT4KCQkJCQkJCQkJCTx0ZWxlY29tIHVzZT0iV1AiIHZhbHVlPSI1NTUtNTU1LTUwMDAiLz4KCQkJCQkJCQkJCTxhZGRyPgoJCQkJCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xMDAxIFZpbGxhZ2UKCQkJCQkJCQkJCQkJQXZlbnVlPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCQk8Y2l0eT5Qb3J0bGFuZDwvY2l0eT4KCQkJCQkJCQkJCQk8c3RhdGU+T1I8L3N0YXRlPgoJCQkJCQkJCQkJCTxwb3N0YWxDb2RlPjk5MTIzPC9wb3N0YWxDb2RlPgoJCQkJCQkJCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQkJCQkJCQkJPC9hZGRyPgoJCQkJCQkJCQk8L3JlcHJlc2VudGVkT3JnYW5pemF0aW9uPgoJCQkJCQkJCTwvYXNzaWduZWRFbnRpdHk+CgkJCQkJCQk8L3BlcmZvcm1lcj4KCQkJCQkJCTxwYXJ0aWNpcGFudCB0eXBlQ29kZT0iREVWIj4KCQkJCQkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iTUFOVSI+CgkJCQkJCQkJCTwhLS0gKiogUHJvZHVjdCBpbnN0YW5jZSAqKiAtLT4KCQkJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4zNyIvPgoJCQkJCQkJCQk8aWQgcm9vdD0iNzQyYWVlMzAtMjFjNS0xMWUxLWJmYzItMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQkJCTxwbGF5aW5nRGV2aWNlPgoJCQkJCQkJCQkJPGNvZGUgY29kZT0iOTA0MTIwMDYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJCQkJZGlzcGxheU5hbWU9IkNvbG9ub3Njb3BlIi8+CgkJCQkJCQkJCTwvcGxheWluZ0RldmljZT4KCQkJCQkJCQkJPHNjb3BpbmdFbnRpdHk+CgkJCQkJCQkJCQk8aWQgcm9vdD0iZWI5MzYwMTAtN2IxNy0xMWRiLTlmZTEtMDgwMDIwMGM5YjY1Ii8+CgkJCQkJCQkJCTwvc2NvcGluZ0VudGl0eT4KCQkJCQkJCQk8L3BhcnRpY2lwYW50Um9sZT4KCQkJCQkJCTwvcGFydGljaXBhbnQ+CgkJCQkJCTwvcHJvY2VkdXJlPgoJCQkJCTwvZW50cnk+CgkJCQkJPGVudHJ5PgoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBQcm9jZWR1cmUgYWN0aXZpdHkgb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjEzIi8+CgkJCQkJCQk8aWQgZXh0ZW5zaW9uPSIxMjM0NTY3ODkiIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5Ii8+CgkJCQkJCQk8Y29kZSBjb2RlPSIyNzQwMjUwMDUiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiCgkJCQkJCQkJZGlzcGxheU5hbWU9IkNvbG9uaWMgcG9seXBlY3RvbXkiIGNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQtQ1QiPgoJCQkJCQkJCTxvcmlnaW5hbFRleHQ+CgkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiNQcm9jMSIvPgoJCQkJCQkJCTwvb3JpZ2luYWxUZXh0PgoJCQkJCQkJPC9jb2RlPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iYWJvcnRlZCIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMTEwMjAzIi8+CgkJCQkJCQk8cHJpb3JpdHlDb2RlIGNvZGU9IkNSIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjciCgkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkFjdFByaW9yaXR5IiBkaXNwbGF5TmFtZT0iQ2FsbGJhY2sgcmVzdWx0cyIvPgoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIvPgoJCQkJCQkJPG1ldGhvZENvZGUgbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQk8dGFyZ2V0U2l0ZUNvZGUgY29kZT0iNDE2OTQ5MDA4IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiIGRpc3BsYXlOYW1lPSJBYmRvbWVuIGFuZCBwZWx2aXMiLz4KCQkJCQkJCTxwZXJmb3JtZXI+CgkJCQkJCQkJPGFzc2lnbmVkRW50aXR5PgoJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNSIgZXh0ZW5zaW9uPSIxMjM0Ii8+CgkJCQkJCQkJCTxhZGRyPgoJCQkJCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjE3IERhd3MgUmQuPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCTxjaXR5PkJsdWUgQmVsbDwvY2l0eT4KCQkJCQkJCQkJCTxzdGF0ZT5NQTwvc3RhdGU+CgkJCQkJCQkJCQk8cG9zdGFsQ29kZT4wMjM2ODwvcG9zdGFsQ29kZT4KCQkJCQkJCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQkJCQkJCQk8L2FkZHI+CgkJCQkJCQkJCTx0ZWxlY29tIHVzZT0iV1AiIHZhbHVlPSIoNTU1KTU1NS01NTUtMTIzNCIvPgoJCQkJCQkJCQk8cmVwcmVzZW50ZWRPcmdhbml6YXRpb24+CgkJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNSIvPgoJCQkJCQkJCQkJPG5hbWU+Q29tbXVuaXR5IEhlYWx0aCBhbmQgSG9zcGl0YWxzPC9uYW1lPgoJCQkJCQkJCQkJPHRlbGVjb20gbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQk8YWRkciBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPC9yZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4KCQkJCQkJCQk8L2Fzc2lnbmVkRW50aXR5PgoJCQkJCQkJPC9wZXJmb3JtZXI+CgkJCQkJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IkxPQyI+CgkJCQkJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9IlNETE9DIj4KCQkJCQkJCQkJPCEtLSAqKiBTZXJ2aWNlIGRlbGl2ZXJ5IGxvY2F0aW9uICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjMyIi8+CgkJCQkJCQkJCTxjb2RlIGNvZGU9IjExMTgtOSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4yNTkiCgkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iSGVhbHRoY2FyZVNlcnZpY2VMb2NhdGlvbiIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJHYXN0cm9lbnRlcm9sb2d5IENsaW5pYyIvPgoJCQkJCQkJCQk8YWRkcj4KCQkJCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xNyBEYXdzIFJkLjwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQkJCQkJCQk8Y2l0eT5CbHVlIEJlbGw8L2NpdHk+CgkJCQkJCQkJCQk8c3RhdGU+TUE8L3N0YXRlPgoJCQkJCQkJCQkJPHBvc3RhbENvZGU+MDIzNjg8L3Bvc3RhbENvZGU+CgkJCQkJCQkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJCQkJCQkJPC9hZGRyPgoJCQkJCQkJCQk8dGVsZWNvbSBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPHBsYXlpbmdFbnRpdHkgY2xhc3NDb2RlPSJQTEMiPgoJCQkJCQkJCQkJPG5hbWU+Q29tbXVuaXR5IEdhc3Ryb2VudGVyb2xvZ3kgQ2xpbmljPC9uYW1lPgoJCQkJCQkJCQk8L3BsYXlpbmdFbnRpdHk+CgkJCQkJCQkJPC9wYXJ0aWNpcGFudFJvbGU+CgkJCQkJCQk8L3BhcnRpY2lwYW50PgoJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCTwvZW50cnk+CgkJCQkJPGVudHJ5PgoJCQkJCQk8YWN0IGNsYXNzQ29kZT0iQUNUIiBtb29kQ29kZT0iSU5UIj4KCQkJCQkJCTwhLS0gUHJvY2VkdXJlIGFjdGl2aXR5IGFjdCAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMTIiLz4KCQkJCQkJCTxpZCByb290PSIxLjIuMy40LjUuNi43LjgiIGV4dGVuc2lvbj0iMTIzNDU2NyIvPgoJCQkJCQkJPGNvZGUgY29kZT0iMjc0MDI1MDA1IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJTTk9NRUQgQ1QiIGRpc3BsYXlOYW1lPSJDb2xvbmljIHBvbHlwZWN0b215Ij4KCQkJCQkJCQk8b3JpZ2luYWxUZXh0PgoJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjUHJvYzEiLz4KCQkJCQkJCQk8L29yaWdpbmFsVGV4dD4KCQkJCQkJCTwvY29kZT4KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMTEwMjAzIi8+CgkJCQkJCQk8cHJpb3JpdHlDb2RlIGNvZGU9IkNSIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjciCgkJCQkJCQkJY29kZVN5c3RlbU5hbWU9IkFjdFByaW9yaXR5IiBkaXNwbGF5TmFtZT0iQ2FsbGJhY2sgcmVzdWx0cyIvPgoJCQkJCQkJPHBlcmZvcm1lcj4KCQkJCQkJCQk8YXNzaWduZWRFbnRpdHk+CgkJCQkJCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOSIgZXh0ZW5zaW9uPSIxMjM0Ii8+CgkJCQkJCQkJCTxhZGRyPgoJCQkJCQkJCQkJPHN0cmVldEFkZHJlc3NMaW5lPjE3IERhd3MgUmQuPC9zdHJlZXRBZGRyZXNzTGluZT4KCQkJCQkJCQkJCTxjaXR5PkJsdWUgQmVsbDwvY2l0eT4KCQkJCQkJCQkJCTxzdGF0ZT5NQTwvc3RhdGU+CgkJCQkJCQkJCQk8cG9zdGFsQ29kZT4wMjM2ODwvcG9zdGFsQ29kZT4KCQkJCQkJCQkJCTxjb3VudHJ5PlVTPC9jb3VudHJ5PgoJCQkJCQkJCQk8L2FkZHI+CgkJCQkJCQkJCTx0ZWxlY29tIHVzZT0iV1AiIHZhbHVlPSIoNTU1KTU1NS01NTUtMTIzNCIvPgoJCQkJCQkJCQk8cmVwcmVzZW50ZWRPcmdhbml6YXRpb24+CgkJCQkJCQkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNSIvPgoJCQkJCQkJCQkJPG5hbWU+Q29tbXVuaXR5IEhlYWx0aCBhbmQgSG9zcGl0YWxzPC9uYW1lPgoJCQkJCQkJCQkJPHRlbGVjb20gbnVsbEZsYXZvcj0iVU5LIi8+CgkJCQkJCQkJCQk8YWRkciBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPC9yZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4KCQkJCQkJCQk8L2Fzc2lnbmVkRW50aXR5PgoJCQkJCQkJPC9wZXJmb3JtZXI+CgkJCQkJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IkxPQyI+CgkJCQkJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9IlNETE9DIj4KCQkJCQkJCQkJPCEtLSAqKiBTZXJ2aWNlIGRlbGl2ZXJ5IGxvY2F0aW9uICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjMyIi8+CgkJCQkJCQkJCTxjb2RlIGNvZGU9IjExMTgtOSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4yNTkiCgkJCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iSGVhbHRoY2FyZVNlcnZpY2VMb2NhdGlvbiIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJHYXN0cm9lbnRlcm9sb2d5IENsaW5pYyIvPgoJCQkJCQkJCQk8YWRkcj4KCQkJCQkJCQkJCTxzdHJlZXRBZGRyZXNzTGluZT4xNyBEYXdzIFJkLjwvc3RyZWV0QWRkcmVzc0xpbmU+CgkJCQkJCQkJCQk8Y2l0eT5CbHVlIEJlbGw8L2NpdHk+CgkJCQkJCQkJCQk8c3RhdGU+TUE8L3N0YXRlPgoJCQkJCQkJCQkJPHBvc3RhbENvZGU+MDIzNjg8L3Bvc3RhbENvZGU+CgkJCQkJCQkJCQk8Y291bnRyeT5VUzwvY291bnRyeT4KCQkJCQkJCQkJPC9hZGRyPgoJCQkJCQkJCQk8dGVsZWNvbSBudWxsRmxhdm9yPSJVTksiLz4KCQkJCQkJCQkJPHBsYXlpbmdFbnRpdHkgY2xhc3NDb2RlPSJQTEMiPgoJCQkJCQkJCQkJPG5hbWU+Q29tbXVuaXR5IEdhc3Ryb2VudGVyb2xvZ3kgQ2xpbmljPC9uYW1lPgoJCQkJCQkJCQk8L3BsYXlpbmdFbnRpdHk+CgkJCQkJCQkJPC9wYXJ0aWNpcGFudFJvbGU+CgkJCQkJCQk8L3BhcnRpY2lwYW50PgoJCQkJCQk8L2FjdD4KCQkJCQk8L2VudHJ5PgoJCQkJPC9zZWN0aW9uPgoJCQk8L2NvbXBvbmVudD4KCQkJPCEtLSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFJFU1VMVFMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAtLT4KCQkJPGNvbXBvbmVudD4KCQkJCTxzZWN0aW9uPgoJCQkJCTwhLS0gY29uZm9ybXMgdG8gUmVzdWx0cyBzZWN0aW9uIHdpdGggZW50cmllcyBvcHRpb25hbCAtLT4KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi4yLjMiLz4KCQkJCQk8IS0tIFJlc3VsdHMgc2VjdGlvbiB3aXRoIGVudHJpZXMgcmVxdWlyZWQgLS0+CgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuMi4zLjEiLz4KCQkJCQk8Y29kZSBjb2RlPSIzMDk1NC0yIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIKCQkJCQkJZGlzcGxheU5hbWU9IlJFU1VMVFMiLz4KCQkJCQk8dGl0bGU+UkVTVUxUUzwvdGl0bGU+CgkJCQkJPHRleHQ+CgkJCQkJCTx0YWJsZT4KCQkJCQkJCTx0Ym9keT4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZCBjb2xzcGFuPSIyIj5MQUJPUkFUT1JZIElORk9STUFUSU9OPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkIGNvbHNwYW49IjIiPkNoZW1pc3RyaWVzIGFuZCBkcnVnIGxldmVsczwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJyZXN1bHQxIj5IR0IgKE0gMTMtMTggZy9kbDsgRiAxMi0xNgoJCQkJCQkJCQkJCWcvZGwpPC9jb250ZW50PgoJCQkJCQkJCQk8L3RkPgoJCQkJCQkJCQk8dGQ+MTMuMjwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJyZXN1bHQyIj5XQkMgKDQuMy0xMC44IDEwKzMvdWwpPC9jb250ZW50PgoJCQkJCQkJCQk8L3RkPgoJCQkJCQkJCQk8dGQ+Ni43PC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9InJlc3VsdDMiPlBMVCAoMTM1LTE0NSBtZXEvbCk8L2NvbnRlbnQ+CgkJCQkJCQkJCTwvdGQ+CgkJCQkJCQkJCTx0ZD4xMjMgKEwpPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkIGNvbHNwYW49IjIiPkxpdmVyIEZ1bmN0aW9ucyBhbmQgT3RoZXIgTGFib3JhdG9yeSBWYWx1ZXM8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+QUxUIChTR1BUKTwvdGQ+CgkJCQkJCQkJCTx0ZD4zMS4wPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPkFTVCAoU0dPVCk8L3RkPgoJCQkJCQkJCQk8dGQ+MTguMDwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD5HR1Q8L3RkPgoJCQkJCQkJCQk8dGQ+MjguMCBBbGs8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+UGhvczwvdGQ+CgkJCQkJCQkJCTx0ZD44Ni4wPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPlRvdGFsIEJpbGk8L3RkPgoJCQkJCQkJCQk8dGQ+MC4xPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPkFsYnVtaW48L3RkPgoJCQkJCQkJCQk8dGQ+My4yPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkIGNvbHNwYW49IjIiPkJsb29kIENvdW50PC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPldoaXRlIENvdW50PC90ZD4KCQkJCQkJCQkJPHRkPjcuNzwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0ZD5QbGF0ZWxldHM8L3RkPgoJCQkJCQkJCQk8dGQ+MTg3LjA8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+SGVtYXRvY3JpdDwvdGQ+CgkJCQkJCQkJCTx0ZD4yMy43PC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPkhlbW9nbG9iaW48L3RkPgoJCQkJCQkJCQk8dGQ+OC4xPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkIGNvbHNwYW49IjIiPkVMRUNUUk9DQVJESU9HUkFNIChFS0cpIElORk9STUFUSU9OPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPkVLRzwvdGQ+CgkJCQkJCQkJCTx0ZD5TaW51cyByaHl0aG0gd2l0aG91dCBhY3V0ZSBjaGFuZ2VzPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJPC90Ym9keT4KCQkJCQkJPC90YWJsZT4KCQkJCQk8L3RleHQ+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPG9yZ2FuaXplciBjbGFzc0NvZGU9IkJBVFRFUlkiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBSZXN1bHQgb3JnYW5pemVyICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4xIi8+CgkJCQkJCQk8aWQgcm9vdD0iN2Q1YTAyYjAtNjdhNC0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQk8Y29kZSBjb2RlPSI0Mzc4OTAwOSIgZGlzcGxheU5hbWU9IkNCQyBXTyBESUZGRVJFTlRJQUwiCgkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgY29kZVN5c3RlbU5hbWU9IlNOT01FRCBDVCIvPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8Y29tcG9uZW50PgoJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCTwhLS0gKiogUmVzdWx0IG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjIiLz4KCQkJCQkJCQkJPGlkIHJvb3Q9IjEwN2MyZGMwLTY3YTUtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSIzMDMxMy0xIiBkaXNwbGF5TmFtZT0iSEdCIgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBjb2RlU3lzdGVtTmFtZT0iTE9JTkMiLz4KCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjcmVzdWx0MSIvPgoJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDAzMjMxNDMwIi8+CgkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSIxMy4yIiB1bml0PSJnL2RsIi8+CgkJCQkJCQkJCTxpbnRlcnByZXRhdGlvbkNvZGUgY29kZT0iTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS44MyIvPgoJCQkJCQkJCQk8cmVmZXJlbmNlUmFuZ2U+CgkJCQkJCQkJCQk8b2JzZXJ2YXRpb25SYW5nZT4KCQkJCQkJCQkJCQk8dGV4dD5NIDEzLTE4IGcvZGw7IEYgMTItMTYgZy9kbDwvdGV4dD4KCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb25SYW5nZT4KCQkJCQkJCQkJPC9yZWZlcmVuY2VSYW5nZT4KCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJPC9jb21wb25lbnQ+CgkJCQkJCQk8Y29tcG9uZW50PgoJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCTwhLS0gKiogUmVzdWx0IG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjIiLz4KCQkJCQkJCQkJPGlkIHJvb3Q9IjEwN2MyZGMwLTY3YTUtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSIzMzc2NS05IiBkaXNwbGF5TmFtZT0iV0JDIgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBjb2RlU3lzdGVtTmFtZT0iTE9JTkMiLz4KCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjcmVzdWx0MiIvPgoJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDAzMjMxNDMwIi8+CgkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSI2LjciIHVuaXQ9IjEwKzMvdWwiLz4KCQkJCQkJCQkJPGludGVycHJldGF0aW9uQ29kZSBjb2RlPSJOIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjgzIi8+CgkJCQkJCQkJCTxyZWZlcmVuY2VSYW5nZT4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvblJhbmdlPgoJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iSVZMX1BRIj4KCQkJCQkJCQkJCQkJPGxvdyB2YWx1ZT0iNC4zIiB1bml0PSIxMCszL3VsIi8+CgkJCQkJCQkJCQkJCTxoaWdoIHZhbHVlPSIxMC44IiB1bml0PSIxMCszL3VsIi8+CgkJCQkJCQkJCQkJPC92YWx1ZT4KCQkJCQkJCQkJCTwvb2JzZXJ2YXRpb25SYW5nZT4KCQkJCQkJCQkJPC9yZWZlcmVuY2VSYW5nZT4KCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJPC9jb21wb25lbnQ+CgkJCQkJCQk8Y29tcG9uZW50PgoJCQkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQkJCTwhLS0gKiogUmVzdWx0IG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjIiLz4KCQkJCQkJCQkJPGlkIHJvb3Q9IjEwN2MyZGMwLTY3YTUtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSIyNjUxNS03IiBkaXNwbGF5TmFtZT0iUExUIgoJCQkJCQkJCQkJY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBjb2RlU3lzdGVtTmFtZT0iTE9JTkMiLz4KCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjcmVzdWx0MyIvPgoJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDAzMjMxNDMwIi8+CgkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSIxMjMiIHVuaXQ9IjEwKzMvdWwiLz4KCQkJCQkJCQkJPGludGVycHJldGF0aW9uQ29kZSBjb2RlPSJMIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjgzIi8+CgkJCQkJCQkJCTxyZWZlcmVuY2VSYW5nZT4KCQkJCQkJCQkJCTxvYnNlcnZhdGlvblJhbmdlPgoJCQkJCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iSVZMX1BRIj4KCQkJCQkJCQkJCQkJPGxvdyB2YWx1ZT0iMTUwIiB1bml0PSIxMCszL3VsIi8+CgkJCQkJCQkJCQkJCTxoaWdoIHZhbHVlPSIzNTAiIHVuaXQ9IjEwKzMvdWwiLz4KCQkJCQkJCQkJCQk8L3ZhbHVlPgoJCQkJCQkJCQkJPC9vYnNlcnZhdGlvblJhbmdlPgoJCQkJCQkJCQk8L3JlZmVyZW5jZVJhbmdlPgoJCQkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJCQk8L2NvbXBvbmVudD4KCQkJCQkJPC9vcmdhbml6ZXI+CgkJCQkJPC9lbnRyeT4KCQkJCTwvc2VjdGlvbj4KCQkJPC9jb21wb25lbnQ+CgkJCTwhLS0gKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogU09DSUFMIEhJU1RPUlkgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC0tPgoJCQk8Y29tcG9uZW50PgoJCQkJPHNlY3Rpb24+CgkJCQkJPCEtLSBTb2NpYWwgaGlzdG9yeSBzZWN0aW9uIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuMTciLz4KCQkJCQk8Y29kZSBjb2RlPSIyOTc2Mi0yIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiCgkJCQkJCWRpc3BsYXlOYW1lPSJTb2NpYWwgSGlzdG9yeSIvPgoJCQkJCTx0aXRsZT5TT0NJQUwgSElTVE9SWTwvdGl0bGU+CgkJCQkJPHRleHQ+CgkJCQkJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4KCQkJCQkJCTx0aGVhZD4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aD5Tb2NpYWwgSGlzdG9yeSBFbGVtZW50PC90aD4KCQkJCQkJCQkJPHRoPkRlc2NyaXB0aW9uPC90aD4KCQkJCQkJCQkJPHRoPkVmZmVjdGl2ZSBEYXRlczwvdGg+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGhlYWQ+CgkJCQkJCQk8dGJvZHk+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+CgkJCQkJCQkJCQk8Y29udGVudCBJRD0ic29jMSIvPiBzbW9raW5nIDwvdGQ+CgkJCQkJCQkJCTx0ZD4xIHBhY2sgcGVyIGRheTwvdGQ+CgkJCQkJCQkJCTx0ZD4yMDA1MDUwMSB0byAyMDA5MDIyNzEzMDAwMCswNTAwPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9InNvYzIiLz4gc21va2luZyA8L3RkPgoJCQkJCQkJCQk8dGQ+Tm9uZTwvdGQ+CgkJCQkJCQkJCTx0ZD4yMDA5MDIyNzEzMDAwMCswNTAwIC0gdG9kYXk8L3RkPgoJCQkJCQkJCTwvdHI+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGQ+CgkJCQkJCQkJCQk8Y29udGVudCBJRD0ic29jMyIvPiBBbGNvaG9sIGNvbnN1bXB0aW9uIDwvdGQ+CgkJCQkJCQkJCTx0ZD5Ob25lPC90ZD4KCQkJCQkJCQkJPHRkPjIwMDUwNTAxIC0gPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJPC90Ym9keT4KCQkJCQkJPC90YWJsZT4KCQkJCQk8L3RleHQ+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4KCQkJCQkJCTwhLS0gKiogU21va2luZyBzdGF0dXMgb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40Ljc4Ii8+CgkJCQkJCQk8aWQgZXh0ZW5zaW9uPSIxMjM0NTY3ODkiIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5Ii8+CgkJCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA1MDUwMSIvPgoJCQkJCQkJCTxoaWdoIHZhbHVlPSIyMDA5MDIyNzEzMDAwMCswNTAwIi8+CgkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSI4NTE3MDA2IiBkaXNwbGF5TmFtZT0iRm9ybWVyIHNtb2tlciIKCQkJCQkJCQljb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2Ii8+CgkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJPC9lbnRyeT4KCQkJCQk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPgoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBTb2NpYWwgaGlzdG9yeSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMzgiLz4KCQkJCQkJCTxpZCByb290PSI5YjU2YzI1ZC05MTA0LTQ1ZWUtOWZhNC1lMGYzYWZhYTAxYzEiLz4KCQkJCQkJCTxjb2RlIGNvZGU9IjIyOTgxOTAwNyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQlkaXNwbGF5TmFtZT0iVG9iYWNjbyB1c2UgYW5kIGV4cG9zdXJlIj4KCQkJCQkJCQk8b3JpZ2luYWxUZXh0PgoJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjc29jMSIvPgoJCQkJCQkJCTwvb3JpZ2luYWxUZXh0PgoJCQkJCQkJPC9jb2RlPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA1MDUwMSIvPgoJCQkJCQkJCTxoaWdoIHZhbHVlPSIyMDA5MDIyNzEzMDAwMCswNTAwIi8+CgkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IlNUIj4xIHBhY2sgcGVyIGRheTwvdmFsdWU+CgkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJPC9lbnRyeT4KCQkJCQk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPgoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBTb2NpYWwgaGlzdG9yeSBvYnNlcnZhdGlvbiAqKiAtLT4KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMzgiLz4KCQkJCQkJCTxpZCByb290PSI0NWVmYjYwNC03MDQ5LTRhMmUtYWQzMy1kMzg1NTZjOTYzNmMiLz4KCQkJCQkJCTxjb2RlIGNvZGU9IjIyOTgxOTAwNyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQlkaXNwbGF5TmFtZT0iVG9iYWNjbyB1c2UgYW5kIGV4cG9zdXJlIj4KCQkJCQkJCQk8b3JpZ2luYWxUZXh0PgoJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjc29jMiIvPgoJCQkJCQkJCTwvb3JpZ2luYWxUZXh0PgoJCQkJCQkJPC9jb2RlPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA5MDIyNzEzMDAwMCswNTAwIi8+CgkJCQkJCQk8L2VmZmVjdGl2ZVRpbWU+CgkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IlNUIj5Ob25lPC92YWx1ZT4KCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQk8L2VudHJ5PgoJCQkJCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+CgkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+CgkJCQkJCQk8IS0tICoqIFNvY2lhbCBoaXN0b3J5IG9ic2VydmF0aW9uICoqIC0tPgoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMjIuNC4zOCIvPgoJCQkJCQkJPGlkIHJvb3Q9IjM3Zjc2YzUxLTY0MTEtNGUxZC04YTM3LTk1N2ZkNDlkMmNlZiIvPgoJCQkJCQkJPGNvZGUgY29kZT0iMTYwNTczMDAzIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IgoJCQkJCQkJCWRpc3BsYXlOYW1lPSJBbGNvaG9sIGNvbnN1bXB0aW9uIj4KCQkJCQkJCQk8b3JpZ2luYWxUZXh0PgoJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjc29jMyIvPgoJCQkJCQkJCTwvb3JpZ2luYWxUZXh0PgoJCQkJCQkJPC9jb2RlPgoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQk8ZWZmZWN0aXZlVGltZT4KCQkJCQkJCQk8bG93IHZhbHVlPSIyMDA1MDUwMSIvPgoJCQkJCQkJPC9lZmZlY3RpdmVUaW1lPgoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJTVCI+Tm9uZTwvdmFsdWU+CgkJCQkJCTwvb2JzZXJ2YXRpb24+CgkJCQkJPC9lbnRyeT4KCQkJCTwvc2VjdGlvbj4KCQkJPC9jb21wb25lbnQ+CgkJCTwhLS0gKioqKioqKioqKioqKioqKioqKiogVklUQUwgU0lHTlMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC0tPgoJCQk8Y29tcG9uZW50PgoJCQkJPHNlY3Rpb24+CgkJCQkJPCEtLSBjb25mb3JtcyB0byBWaXRhbCBTaWducyBzZWN0aW9uIHdpdGggZW50cmllcyBvcHRpb25hbCAtLT4KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi4yLjQiLz4KCQkJCQk8IS0tIFZpdGFsIFNpZ25zIHNlY3Rpb24gd2l0aCBlbnRyaWVzIHJlcXVpcmVkIC0tPgoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjIuNC4xIi8+CgkJCQkJPGNvZGUgY29kZT0iODcxNi0zIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIKCQkJCQkJZGlzcGxheU5hbWU9IlZJVEFMIFNJR05TIi8+CgkJCQkJPHRpdGxlPlZJVEFMIFNJR05TPC90aXRsZT4KCQkJCQk8dGV4dD4KCQkJCQkJPHRhYmxlIGJvcmRlcj0iMSIgd2lkdGg9IjEwMCUiPgoJCQkJCQkJPHRoZWFkPgoJCQkJCQkJCTx0cj4KCQkJCQkJCQkJPHRoIGFsaWduPSJyaWdodCI+RGF0ZSAvIFRpbWU6IDwvdGg+CgkJCQkJCQkJCTx0aD5Ob3YgMTQsIDE5OTk8L3RoPgoJCQkJCQkJCQk8dGg+QXByaWwgNywgMjAwMDwvdGg+CgkJCQkJCQkJPC90cj4KCQkJCQkJCTwvdGhlYWQ+CgkJCQkJCQk8dGJvZHk+CgkJCQkJCQkJPHRyPgoJCQkJCQkJCQk8dGggYWxpZ249ImxlZnQiPkhlaWdodDwvdGg+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJ2aXQxIj4xNzcgY208L2NvbnRlbnQ+CgkJCQkJCQkJCTwvdGQ+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJ2aXQyIj4xNzcgY208L2NvbnRlbnQ+CgkJCQkJCQkJCTwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aCBhbGlnbj0ibGVmdCI+V2VpZ2h0PC90aD4KCQkJCQkJCQkJPHRkPgoJCQkJCQkJCQkJPGNvbnRlbnQgSUQ9InZpdDMiPjg2IGtnPC9jb250ZW50PgoJCQkJCQkJCQk8L3RkPgoJCQkJCQkJCQk8dGQ+CgkJCQkJCQkJCQk8Y29udGVudCBJRD0idml0NCI+ODgga2c8L2NvbnRlbnQ+CgkJCQkJCQkJCTwvdGQ+CgkJCQkJCQkJPC90cj4KCQkJCQkJCQk8dHI+CgkJCQkJCQkJCTx0aCBhbGlnbj0ibGVmdCI+Qmxvb2QgUHJlc3N1cmU8L3RoPgoJCQkJCQkJCQk8dGQ+CgkJCQkJCQkJCQk8Y29udGVudCBJRD0idml0NSI+MTMyLzg2IG1tSGc8L2NvbnRlbnQ+CgkJCQkJCQkJCTwvdGQ+CgkJCQkJCQkJCTx0ZD4KCQkJCQkJCQkJCTxjb250ZW50IElEPSJ2aXQ2Ij4xNDUvODggbW1IZzwvY29udGVudD4KCQkJCQkJCQkJPC90ZD4KCQkJCQkJCQk8L3RyPgoJCQkJCQkJPC90Ym9keT4KCQkJCQkJPC90YWJsZT4KCQkJCQk8L3RleHQ+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPG9yZ2FuaXplciBjbGFzc0NvZGU9IkNMVVNURVIiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBWaXRhbCBzaWducyBvcmdhbml6ZXIgKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjI2Ii8+CgkJCQkJCQk8aWQgcm9vdD0iYzZmODgzMjAtNjdhZC0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQk8Y29kZSBjb2RlPSI0NjY4MDAwNSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIC1DVCIgZGlzcGxheU5hbWU9IlZpdGFsIHNpZ25zIi8+CgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIxOTk5MTExNCIvPgoJCQkJCQkJPGNvbXBvbmVudD4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIFZpdGFsIHNpZ24gb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMjciLz4KCQkJCQkJCQkJPGlkIHJvb3Q9ImM2Zjg4MzIxLTY3YWQtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSI4MzAyLTIiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIgZGlzcGxheU5hbWU9IkhlaWdodCIvPgoJCQkJCQkJCQk8dGV4dD4KCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiN2aXQxIi8+CgkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIxOTk5MTExNCIvPgoJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IlBRIiB2YWx1ZT0iMTc3IiB1bml0PSJjbSIvPgoJCQkJCQkJCQk8aW50ZXJwcmV0YXRpb25Db2RlIGNvZGU9Ik4iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODMiCgkJCQkJCQkJCS8+CgkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCTwvY29tcG9uZW50PgoJCQkJCQkJPGNvbXBvbmVudD4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIFZpdGFsIHNpZ24gb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMjciLz4KCQkJCQkJCQkJPGlkIHJvb3Q9ImM2Zjg4MzIxLTY3YWQtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSIzMTQxLTkiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJQYXRpZW50IEJvZHkgV2VpZ2h0IC0gTWVhc3VyZWQiLz4KCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjdml0MyIvPgoJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMTk5OTExMTQiLz4KCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9Ijg2IiB1bml0PSJrZyIvPgoJCQkJCQkJCQk8aW50ZXJwcmV0YXRpb25Db2RlIGNvZGU9Ik4iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODMiCgkJCQkJCQkJCS8+CgkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCTwvY29tcG9uZW50PgoJCQkJCQkJPGNvbXBvbmVudD4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIFZpdGFsIHNpZ24gb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMjciLz4KCQkJCQkJCQkJPGlkIHJvb3Q9ImM2Zjg4MzIxLTY3YWQtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSI4NDgwLTYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIgZGlzcGxheU5hbWU9IkludHJhdmFzY3VsYXIgU3lzdG9saWMiLz4KCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjdml0NSIvPgoJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMTk5OTExMTQiLz4KCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9IjEzMiIgdW5pdD0ibW1bSGddIi8+CgkJCQkJCQkJCTxpbnRlcnByZXRhdGlvbkNvZGUgY29kZT0iTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS44MyIKCQkJCQkJCQkJLz4KCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJPC9jb21wb25lbnQ+CgkJCQkJCTwvb3JnYW5pemVyPgoJCQkJCTwvZW50cnk+CgkJCQkJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4KCQkJCQkJPG9yZ2FuaXplciBjbGFzc0NvZGU9IkNMVVNURVIiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJPCEtLSAqKiBWaXRhbCBzaWducyBvcmdhbml6ZXIgKiogLS0+CgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4yMi40LjI2Ii8+CgkJCQkJCQk8aWQgcm9vdD0iYzZmODgzMjAtNjdhZC0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+CgkJCQkJCQk8Y29kZSBjb2RlPSI0NjY4MDAwNSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIKCQkJCQkJCQljb2RlU3lzdGVtTmFtZT0iU05PTUVEIC1DVCIgZGlzcGxheU5hbWU9IlZpdGFsIHNpZ25zIi8+CgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4KCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDAwMDQwNyIvPgoJCQkJCQkJPGNvbXBvbmVudD4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIFZpdGFsIHNpZ24gb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMjciLz4KCQkJCQkJCQkJPGlkIHJvb3Q9ImM2Zjg4MzIxLTY3YWQtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSI4MzAyLTIiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIgZGlzcGxheU5hbWU9IkhlaWdodCIvPgoJCQkJCQkJCQk8dGV4dD4KCQkJCQkJCQkJCTxyZWZlcmVuY2UgdmFsdWU9IiN2aXQyIi8+CgkJCQkJCQkJCTwvdGV4dD4KCQkJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+CgkJCQkJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDAwMDQwNyIvPgoJCQkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IlBRIiB2YWx1ZT0iMTc3IiB1bml0PSJjbSIvPgoJCQkJCQkJCQk8aW50ZXJwcmV0YXRpb25Db2RlIGNvZGU9Ik4iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODMiCgkJCQkJCQkJCS8+CgkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCTwvY29tcG9uZW50PgoJCQkJCQkJPGNvbXBvbmVudD4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIFZpdGFsIHNpZ24gb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMjciLz4KCQkJCQkJCQkJPGlkIHJvb3Q9ImM2Zjg4MzIxLTY3YWQtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSIzMTQxLTkiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIKCQkJCQkJCQkJCWRpc3BsYXlOYW1lPSJQYXRpZW50IEJvZHkgV2VpZ2h0IC0gTWVhc3VyZWQiLz4KCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjdml0NCIvPgoJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDA0MDciLz4KCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9Ijg4IiB1bml0PSJrZyIvPgoJCQkJCQkJCQk8aW50ZXJwcmV0YXRpb25Db2RlIGNvZGU9Ik4iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODMiCgkJCQkJCQkJCS8+CgkJCQkJCQkJPC9vYnNlcnZhdGlvbj4KCQkJCQkJCTwvY29tcG9uZW50PgoJCQkJCQkJPGNvbXBvbmVudD4KCQkJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPgoJCQkJCQkJCQk8IS0tICoqIFZpdGFsIHNpZ24gb2JzZXJ2YXRpb24gKiogLS0+CgkJCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjIyLjQuMjciLz4KCQkJCQkJCQkJPGlkIHJvb3Q9ImM2Zjg4MzIxLTY3YWQtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPgoJCQkJCQkJCQk8Y29kZSBjb2RlPSI4NDgwLTYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIKCQkJCQkJCQkJCWNvZGVTeXN0ZW1OYW1lPSJMT0lOQyIgZGlzcGxheU5hbWU9IkludHJhdmFzY3VsYXIgU3lzdG9saWMiLz4KCQkJCQkJCQkJPHRleHQ+CgkJCQkJCQkJCQk8cmVmZXJlbmNlIHZhbHVlPSIjdml0NiIvPgoJCQkJCQkJCQk8L3RleHQ+CgkJCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPgoJCQkJCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDA0MDciLz4KCQkJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9IjE0NSIgdW5pdD0ibW1bSGddIi8+CgkJCQkJCQkJCTxpbnRlcnByZXRhdGlvbkNvZGUgY29kZT0iTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS44MyIKCQkJCQkJCQkJLz4KCQkJCQkJCQk8L29ic2VydmF0aW9uPgoJCQkJCQkJPC9jb21wb25lbnQ+CgkJCQkJCTwvb3JnYW5pemVyPgoJCQkJCTwvZW50cnk+CgkJCQk8L3NlY3Rpb24+CgkJCTwvY29tcG9uZW50PgoJCTwvc3RydWN0dXJlZEJvZHk+Cgk8L2NvbXBvbmVudD4KPC9DbGluaWNhbERvY3VtZW50Pgo=","base64").toString();
        var result = bb.parseString(data);

        // check validation
        var val = bb.validator.validateDocumentModel(result);
        expect(val).to.be.true;

        // generate ccda
        var xml = bbg.generateCCD(result);

        // parse generated ccda
        var result2 = bb.parseString(xml);
        var val2 = bb.validator.validateDocumentModel(result2);
        expect(val2).to.be.true;

        // re-generate
        var xml2 = bbg.generateCCD(result2);

        delete result.errors;
        delete result2.errors;

        assert.deepEqual(result2, result);
    });

    it('Vitera_CCDA_SMART_Sample.xml should still be same', function () {
        var result = bb.parseString(data);

        // check validation
        var val = bb.validator.validateDocumentModel(result);

        // generate ccda
        var xml = bbg.generateCCD(result);

        // parse generated ccda
        var result2 = bb.parseString(xml);

        // re-generate
        var xml2 = bbg.generateCCD(result2);

        delete result.errors;
        delete result2.errors;

        assert.deepEqual(result2, result);
    });

    it('VA_CCD_Sample_File_Version_12_5_1.xml should still be same', function () {
        var result = bb.parseString(data);
        result.meta.sections.sort();

        // check validation
        var val = bb.validator.validateDocumentModel(result);

        // generate ccda
        var xml = bbg.generateCCD(result);

        // parse generated ccda
        var result2 = bb.parseString(xml);
        result2.meta.sections.sort();

        // re-generate
        var xml2 = bbg.generateCCD(result2);

        delete result.errors;
        delete result2.errors;
        result.data.results.forEach(function (entry) {
            entry.results.forEach(function (r) {
                delete r.text;
            });
        });

        assert.deepEqual(result2, result);
    });

    it('SampleCCDDocument.xml should still be same', function () {
        var data = Buffer("PD94bWwgdmVyc2lvbj0iMS4wIj8+DQo8P3htbC1zdHlsZXNoZWV0IHR5cGU9InRleHQveHNsIiBocmVmPSJDREFTY2hlbWFzXGNkYVxTY2hlbWFzXENDRC54c2wiPz4NCjwhLS0gVGhlIGZvbGxvd2luZyBzYW1wbGUgZG9jdW1lbnQgZGVwaWN0cyBhIGZpY3Rpb25hbCBjaGFyYWN0ZXLigJlzIGhlYWx0aCBzdW1tYXJ5LiBBbnkgcmVzZW1ibGFuY2UgdG8gYSByZWFsIHBlcnNvbiBpcyBjb2luY2lkZW50YWwuIC0tPg0KPENsaW5pY2FsRG9jdW1lbnQgeG1sbnM9InVybjpobDctb3JnOnYzIiB4bWxuczp2b2M9InVybjpobDctb3JnOnYzL3ZvYyIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgeHNpOnNjaGVtYUxvY2F0aW9uPSJ1cm46aGw3LW9yZzp2MyBDREEueHNkIj4NCgk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCkNEQSBIZWFkZXINCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqDQotLT4NCgk8dHlwZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEuMyIgZXh0ZW5zaW9uPSJQT0NEX0hEMDAwMDQwIi8+DQoJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMSIvPiA8IS0tIENDRCB2MS4wIFRlbXBsYXRlcyBSb290IC0tPg0KCTxpZCByb290PSJkYjczNDY0Ny1mYzk5LTQyNGMtYTg2NC03ZTNjZGE4MmU3MDMiLz4NCgk8Y29kZSBjb2RlPSIzNDEzMy05IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGRpc3BsYXlOYW1lPSJTdW1tYXJpemF0aW9uIG9mIGVwaXNvZGUgbm90ZSIvPg0KCTx0aXRsZT5Hb29kIEhlYWx0aCBDbGluaWMgQ29udGludWl0eSBvZiBDYXJlIERvY3VtZW50PC90aXRsZT4NCgk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDA0MDcxMzAwMDArMDUwMCIvPg0KCTxjb25maWRlbnRpYWxpdHlDb2RlIGNvZGU9Ik4iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuMjUiLz4NCgk8bGFuZ3VhZ2VDb2RlIGNvZGU9ImVuLVVTIi8+DQoJPHJlY29yZFRhcmdldD4NCgkJPHBhdGllbnRSb2xlPg0KCQkJPGlkIGV4dGVuc2lvbj0iOTk2LTc1Ni00OTUiIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5LjUiLz4NCgkJCTxwYXRpZW50Pg0KCQkJCTxuYW1lPg0KCQkJCQk8Z2l2ZW4+SGVucnk8L2dpdmVuPg0KCQkJCQk8ZmFtaWx5PkxldmluPC9mYW1pbHk+DQoJCQkJCTxzdWZmaXg+dGhlIDd0aDwvc3VmZml4Pg0KCQkJCTwvbmFtZT4NCgkJCQk8YWRtaW5pc3RyYXRpdmVHZW5kZXJDb2RlIGNvZGU9Ik0iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuMSIvPg0KCQkJCTxiaXJ0aFRpbWUgdmFsdWU9IjE5MzIwOTI0Ii8+DQoJCQk8L3BhdGllbnQ+DQoJCQk8cHJvdmlkZXJPcmdhbml6YXRpb24+DQoJCQkJPGlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5LjUiLz4NCgkJCQk8bmFtZT5Hb29kIEhlYWx0aCBDbGluaWM8L25hbWU+DQoJCQk8L3Byb3ZpZGVyT3JnYW5pemF0aW9uPg0KCQk8L3BhdGllbnRSb2xlPg0KCTwvcmVjb3JkVGFyZ2V0Pg0KCTxhdXRob3I+DQoJCTx0aW1lIHZhbHVlPSIyMDAwMDQwNzEzMDAwMCswNTAwIi8+DQoJCTxhc3NpZ25lZEF1dGhvcj4NCgkJCTxpZCByb290PSIyMGNmMTRmYi1iNjVjLTRjOGMtYTU0ZC1iMGNjYTgzNGMxOGMiLz4NCgkJCTxhc3NpZ25lZFBlcnNvbj4NCgkJCQk8bmFtZT48cHJlZml4PkRyLjwvcHJlZml4PjxnaXZlbj5Sb2JlcnQ8L2dpdmVuPjxmYW1pbHk+RG9saW48L2ZhbWlseT48L25hbWU+DQoJCQk8L2Fzc2lnbmVkUGVyc29uPg0KCQkJPHJlcHJlc2VudGVkT3JnYW5pemF0aW9uPg0KCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ii8+DQoJCQkJPG5hbWU+R29vZCBIZWFsdGggQ2xpbmljPC9uYW1lPg0KCQkJPC9yZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4NCgkJPC9hc3NpZ25lZEF1dGhvcj4NCgk8L2F1dGhvcj4NCgk8aW5mb3JtYW50Pg0KCQk8YXNzaWduZWRFbnRpdHk+DQoJCQk8aWQgbnVsbEZsYXZvcj0iTkkiLz4NCgkJCTxyZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4NCgkJCQk8aWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNSIvPg0KCQkJCTxuYW1lPkdvb2QgSGVhbHRoIENsaW5pYzwvbmFtZT4NCgkJCTwvcmVwcmVzZW50ZWRPcmdhbml6YXRpb24+DQoJCTwvYXNzaWduZWRFbnRpdHk+DQoJPC9pbmZvcm1hbnQ+DQoJPGN1c3RvZGlhbj4NCgkJPGFzc2lnbmVkQ3VzdG9kaWFuPg0KCQkJPHJlcHJlc2VudGVkQ3VzdG9kaWFuT3JnYW5pemF0aW9uPg0KCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ii8+DQoJCQkJPG5hbWU+R29vZCBIZWFsdGggQ2xpbmljPC9uYW1lPg0KCQkJPC9yZXByZXNlbnRlZEN1c3RvZGlhbk9yZ2FuaXphdGlvbj4NCgkJPC9hc3NpZ25lZEN1c3RvZGlhbj4NCgk8L2N1c3RvZGlhbj4NCgk8bGVnYWxBdXRoZW50aWNhdG9yPg0KCQk8dGltZSB2YWx1ZT0iMjAwMDA0MDcxMzAwMDArMDUwMCIvPg0KCQk8c2lnbmF0dXJlQ29kZSBjb2RlPSJTIi8+DQoJCTxhc3NpZ25lZEVudGl0eT4NCgkJCTxpZCBudWxsRmxhdm9yPSJOSSIvPg0KCQkJPHJlcHJlc2VudGVkT3JnYW5pemF0aW9uPg0KCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ii8+DQoJCQkJPG5hbWU+R29vZCBIZWFsdGggQ2xpbmljPC9uYW1lPg0KCQkJPC9yZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4NCgkJPC9hc3NpZ25lZEVudGl0eT4NCgk8L2xlZ2FsQXV0aGVudGljYXRvcj4NCgk8cGFydGljaXBhbnQgdHlwZUNvZGU9IklORCI+DQoJCTxhc3NvY2lhdGVkRW50aXR5IGNsYXNzQ29kZT0iR1VBUiI+DQoJCQk8aWQgcm9vdD0iNGZmNTE1NzAtODNhOS00N2I3LTkxZjItOTNiYTMwMzczMTQxIi8+DQoJCQk8YWRkcj4NCgkJCQk8c3RyZWV0QWRkcmVzc0xpbmU+MTcgRGF3cyBSZC48L3N0cmVldEFkZHJlc3NMaW5lPg0KCQkJCTxjaXR5PkJsdWUgQmVsbDwvY2l0eT4NCgkJCQk8c3RhdGU+TUE8L3N0YXRlPg0KCQkJCTxwb3N0YWxDb2RlPjAyMzY4PC9wb3N0YWxDb2RlPg0KCQkJPC9hZGRyPg0KCQkJPHRlbGVjb20gdmFsdWU9InRlbDooODg4KTU1NS0xMjEyIi8+DQoJCQk8YXNzb2NpYXRlZFBlcnNvbj4NCgkJCQk8bmFtZT4NCgkJCQkJPGdpdmVuPktlbm5ldGg8L2dpdmVuPg0KCQkJCQk8ZmFtaWx5PlJvc3M8L2ZhbWlseT4NCgkJCQk8L25hbWU+DQoJCQk8L2Fzc29jaWF0ZWRQZXJzb24+DQoJCTwvYXNzb2NpYXRlZEVudGl0eT4NCgk8L3BhcnRpY2lwYW50Pg0KCTxwYXJ0aWNpcGFudCB0eXBlQ29kZT0iSU5EIj4NCgkJPGFzc29jaWF0ZWRFbnRpdHkgY2xhc3NDb2RlPSJOT0siPg0KCQkJPGlkIHJvb3Q9IjRhYzcxNTE0LTZhMTAtNDE2NC05NzE1LWY4ZDk2YWY0OGU2ZCIvPg0KCQkJPGNvZGUgY29kZT0iNjU2NTYwMDUiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJCaWlvbG9naWNhbCBtb3RoZXIiLz4NCgkJCTx0ZWxlY29tIHZhbHVlPSJ0ZWw6KDk5OSk1NTUtMTIxMiIvPg0KCQkJPGFzc29jaWF0ZWRQZXJzb24+DQoJCQkJPG5hbWU+DQoJCQkJCTxnaXZlbj5IZW5yaWV0dGE8L2dpdmVuPg0KCQkJCQk8ZmFtaWx5PkxldmluPC9mYW1pbHk+DQoJCQkJPC9uYW1lPg0KCQkJPC9hc3NvY2lhdGVkUGVyc29uPg0KCQk8L2Fzc29jaWF0ZWRFbnRpdHk+DQoJPC9wYXJ0aWNpcGFudD4NCgk8ZG9jdW1lbnRhdGlvbk9mPg0KCQk8c2VydmljZUV2ZW50IGNsYXNzQ29kZT0iUENQUiI+DQoJCQk8ZWZmZWN0aXZlVGltZT48bG93IHZhbHVlPSIxOTMyMDkyNCIvPjxoaWdoIHZhbHVlPSIyMDAwMDQwNyIvPjwvZWZmZWN0aXZlVGltZT4NCgkJCTxwZXJmb3JtZXIgdHlwZUNvZGU9IlBSRiI+DQoJCQkJPGZ1bmN0aW9uQ29kZSBjb2RlPSJQQ1AiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODgiLz4NCgkJCQk8dGltZT48bG93IHZhbHVlPSIxOTkwIi8+PGhpZ2ggdmFsdWU9JzIwMDAwNDA3Jy8+PC90aW1lPg0KCQkJCTxhc3NpZ25lZEVudGl0eT4NCgkJCQkJPGlkIHJvb3Q9IjIwY2YxNGZiLWI2NWMtNGM4Yy1hNTRkLWIwY2NhODM0YzE4YyIvPg0KCQkJCQk8YXNzaWduZWRQZXJzb24+DQoJCQkJCQk8bmFtZT48cHJlZml4PkRyLjwvcHJlZml4PjxnaXZlbj5Sb2JlcnQ8L2dpdmVuPjxmYW1pbHk+RG9saW48L2ZhbWlseT48L25hbWU+DQoJCQkJCTwvYXNzaWduZWRQZXJzb24+DQoJCQkJCTxyZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4NCgkJCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ii8+DQoJCQkJCQk8bmFtZT5Hb29kIEhlYWx0aCBDbGluaWM8L25hbWU+DQoJCQkJCTwvcmVwcmVzZW50ZWRPcmdhbml6YXRpb24+DQoJCQkJPC9hc3NpZ25lZEVudGl0eT4NCgkJCTwvcGVyZm9ybWVyPg0KCQk8L3NlcnZpY2VFdmVudD4NCgk8L2RvY3VtZW50YXRpb25PZj4NCgk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCkNEQSBCb2R5DQoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KLS0+DQoJPGNvbXBvbmVudD4NCgkJPHN0cnVjdHVyZWRCb2R5Pg0KCQkJCQk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNClB1cnBvc2Ugc2VjdGlvbg0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCi0tPg0KPGNvbXBvbmVudD4NCjxzZWN0aW9uPg0KCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMTMnLz4gPCEtLSBQdXJwb3NlIHNlY3Rpb24gdGVtcGxhdGUgLS0+DQoJPGNvZGUgY29kZT0iNDg3NjQtNSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+DQoJPHRpdGxlPlN1bW1hcnkgUHVycG9zZTwvdGl0bGU+DQoJPHRleHQ+VHJhbnNmZXIgb2YgY2FyZTwvdGV4dD4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8YWN0IGNsYXNzQ29kZT0iQUNUIiBtb29kQ29kZT0iRVZOIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzAnLz4gPCEtLSBQdXJwb3NlIGFjdGl2aXR5IHRlbXBsYXRlIC0tPg0KCQkJPGNvZGUgY29kZT0iMjM3NDUwMDEiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJEb2N1bWVudGF0aW9uIHByb2NlZHVyZSIvPg0KCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlJTT04iPg0KCQkJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8Y29kZSBjb2RlPSIzMDgyOTIwMDciIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJUcmFuc2ZlciBvZiBjYXJlIi8+DQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCTwvYWN0Pg0KCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJPC9hY3Q+DQoJPC9lbnRyeT4NCjwvc2VjdGlvbj4NCjwvY29tcG9uZW50Pg0KCQkJCQk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNClBheWVycyBzZWN0aW9uDQoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KLS0+DQo8Y29tcG9uZW50Pg0KPHNlY3Rpb24+DQoJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS45Jy8+IDwhLS0gUGF5ZXJzIHNlY3Rpb24gdGVtcGxhdGUgLS0+DQoJPGNvZGUgY29kZT0iNDg3NjgtNiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+DQoJPHRpdGxlPlBheWVyczwvdGl0bGU+DQoJPHRleHQ+DQoJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4NCgkJCTx0aGVhZD4NCgkJCTx0cj48dGg+UGF5ZXIgbmFtZTwvdGg+PHRoPlBvbGljeSB0eXBlIC8gQ292ZXJhZ2UgdHlwZTwvdGg+PHRoPkNvdmVyZWQgcGFydHkgSUQ8L3RoPiA8dGg+QXV0aG9yaXphdGlvbihzKTwvdGg+PC90cj4NCgkJCTwvdGhlYWQ+DQoJCQk8dGJvZHk+DQoJCQkJPHRyPg0KCQkJCQk8dGQ+R29vZCBIZWFsdGggSW5zdXJhbmNlPC90ZD4gDQoJCQkJCTx0ZD5FeHRlbmRlZCBoZWFsdGhjYXJlIC8gU2VsZjwvdGQ+IA0KCQkJCQk8dGQ+MTRkNGE1MjAtN2FhZS0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2PC90ZD4NCgkJCQkJPHRkPkNvbG9ub3Njb3B5PC90ZD4NCgkJCQk8L3RyPg0KCQkJPC90Ym9keT4NCgkJPC90YWJsZT4NCgk8L3RleHQ+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPGFjdCBjbGFzc0NvZGU9IkFDVCIgbW9vZENvZGU9IkRFRiI+DQoJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjIwJy8+IDwhLS0gQ292ZXJhZ2UgYWN0aXZpdHkgdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iMWZlMmNkZDAtN2FhZC0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2Ii8+DQoJCQk8Y29kZSBjb2RlPSI0ODc2OC02IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGRpc3BsYXlOYW1lPSJQYXltZW50IHNvdXJjZXMiLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJDT01QIj4NCgkJCQk8YWN0IGNsYXNzQ29kZT0iQUNUIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yNicvPiA8IS0tIFBvbGljeSBhY3Rpdml0eSB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9IjNlNjc2YTUwLTdhYWMtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQk8Y29kZSBjb2RlPSJFSENQT0wiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIgZGlzcGxheU5hbWU9IkV4dGVuZGVkIGhlYWx0aGNhcmUiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCTxwZXJmb3JtZXIgdHlwZUNvZGU9IlBSRiI+DQoJCQkJCQk8YXNzaWduZWRFbnRpdHk+DQoJCQkJCQkJPGlkIHJvb3Q9IjMyOWZjZGYwLTdhYjMtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQkJCTxyZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4NCgkJCQkJCQkJPG5hbWU+R29vZCBIZWFsdGggSW5zdXJhbmNlPC9uYW1lPg0KCQkJCQkJCTwvcmVwcmVzZW50ZWRPcmdhbml6YXRpb24+DQoJCQkJCQk8L2Fzc2lnbmVkRW50aXR5Pg0KCQkJCQk8L3BlcmZvcm1lcj4NCgkJCQkJPHBhcnRpY2lwYW50IHR5cGVDb2RlPSJDT1YiPg0KCQkJCQkJPHBhcnRpY2lwYW50Um9sZT4NCgkJCQkJCQk8aWQgcm9vdD0iMTRkNGE1MjAtN2FhZS0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCQkJPGNvZGUgY29kZT0iU0VMRiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS4xMTEiIGRpc3BsYXlOYW1lPSJTZWxmIi8+DQoJCQkJCQk8L3BhcnRpY2lwYW50Um9sZT4NCgkJCQkJPC9wYXJ0aWNpcGFudD4NCgkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJSRUZSIj4NCgkJCQkJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMTknLz4gPCEtLSBBdXRob3JpemF0aW9uIGFjdGl2aXR5IHRlbXBsYXRlIC0tPg0KCQkJCQkJCTxpZCByb290PSJmNGRjZTc5MC04MzI4LTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4NCgkJCQkJCQk8Y29kZSBudWxsRmxhdm9yPSJOQSIvPg0KCQkJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiI+DQoJCQkJCQkJCTxwcm9jZWR1cmUgY2xhc3NDb2RlPSJQUk9DIiBtb29kQ29kZT0iUFJNUyI+DQoJCQkJCQkJCQk8Y29kZSBjb2RlPSI3Mzc2MTAwMSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkNvbG9ub3Njb3B5Ii8+DQoJCQkJCQkJCTwvcHJvY2VkdXJlPg0KCQkJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCQkJCQk8L2FjdD4NCgkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJCQk8L2FjdD4NCgkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCTwvYWN0Pg0KCTwvZW50cnk+DQo8L3NlY3Rpb24+DQo8L2NvbXBvbmVudD4NCgkJCQkJPCEtLSANCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqDQpBZHZhbmNlIERpcmVjdGl2ZXMgc2VjdGlvbg0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCi0tPg0KPGNvbXBvbmVudD4NCjxzZWN0aW9uPg0KCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMScvPiA8IS0tIEFkdmFuY2UgZGlyZWN0aXZlcyBzZWN0aW9uIHRlbXBsYXRlIC0tPg0KCTxjb2RlIGNvZGU9IjQyMzQ4LTMiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIvPg0KCTx0aXRsZT5BZHZhbmNlIERpcmVjdGl2ZXM8L3RpdGxlPg0KCTx0ZXh0Pg0KCQk8dGFibGUgYm9yZGVyPSIxIiB3aWR0aD0iMTAwJSI+DQoJCQk8dGhlYWQ+DQoJCQk8dHI+PHRoPkRpcmVjdGl2ZTwvdGg+PHRoPkRlc2NyaXB0aW9uPC90aD48dGg+VmVyaWZpY2F0aW9uPC90aD48dGg+U3VwcG9ydGluZyBEb2N1bWVudChzKTwvdGg+PC90cj4NCgkJCTwvdGhlYWQ+DQoJCQk8dGJvZHk+DQoJCQkJPHRyPg0KCQkJCQk8dGQ+UmVzdXNjaXRhdGlvbiBzdGF0dXM8L3RkPiANCgkJCQkJPHRkPjxjb250ZW50IElEPSJBRDEiPkRvIG5vdCByZXN1c2NpdGF0ZTwvY29udGVudD48L3RkPiANCgkJCQkJPHRkPkRyLiBSb2JlcnQgRG9saW4sIE5vdiAwNywgMTk5OTwvdGQ+DQoJCQkJCTx0ZD48bGlua0h0bWwgaHJlZj0iQWR2YW5jZURpcmVjdGl2ZS5iNTBiNzkxMC03ZmZiLTRmNGMtYmJlNC0xNzdlZDY4Y2JiZjMucGRmIj5BZHZhbmNlIGRpcmVjdGl2ZTwvbGlua0h0bWw+PC90ZD4NCgkJCQk8L3RyPg0KCQkJPC90Ym9keT4NCgkJPC90YWJsZT4NCgk8L3RleHQ+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMTcnLz4gPCEtLSBBZHZhbmNlIGRpcmVjdGl2ZSBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSI5YjU0YzNjOS0xNjczLTQ5YzctYWVmOS1iMDM3ZWQ3MmVkMjciLz4NCgkJCTxjb2RlIGNvZGU9IjMwNDI1MTAwOCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IlJlc3VzY2l0YXRpb24iLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iMzA0MjUzMDA2IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iRG8gbm90IHJlc3VzY2l0YXRlIj4NCgkJCQk8b3JpZ2luYWxUZXh0PjxyZWZlcmVuY2UgdmFsdWU9IiNBRDEiLz48L29yaWdpbmFsVGV4dD4NCgkJCTwvdmFsdWU+DQoJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IlZSRiI+DQoJCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS41OCcvPiA8IS0tIFZlcmlmaWNhdGlvbiBvZiBhbiBhZHZhbmNlIGRpcmVjdGl2ZSBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQk8dGltZSB2YWx1ZT0iMTk5OTExMDciLz4NCgkJCQk8cGFydGljaXBhbnRSb2xlPg0KCQkJCQk8aWQgcm9vdD0iMjBjZjE0ZmItYjY1Yy00YzhjLWE1NGQtYjBjY2E4MzRjMThjIi8+DQoJCQkJPC9wYXJ0aWNpcGFudFJvbGU+DQoJCQk8L3BhcnRpY2lwYW50Pg0KCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJSRUZSIj4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjM3Jy8+IDwhLS0gQWR2YW5jZSBkaXJlY3RpdmUgc3RhdHVzIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8Y29kZSBjb2RlPSIzMzk5OS00IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGRpc3BsYXlOYW1lPSJTdGF0dXMiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0UiIGNvZGU9IjE1MjQwMDA3IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQ3VycmVudCBhbmQgdmVyaWZpZWQiLz4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJCTxyZWZlcmVuY2UgdHlwZUNvZGU9IlJFRlIiPg0KCQkJCTxleHRlcm5hbERvY3VtZW50Pg0KCQkJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjM2Jy8+IDwhLS0gQWR2YW5jZSBkaXJlY3RpdmUgcmVmZXJlbmNlIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iYjUwYjc5MTAtN2ZmYi00ZjRjLWJiZTQtMTc3ZWQ2OGNiYmYzIi8+DQoJCQkJCTxjb2RlIGNvZGU9IjM3MTUzODAwNiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkFkdmFuY2UgZGlyZWN0aXZlIi8+DQoJCQkJCTx0ZXh0IG1lZGlhVHlwZT0iYXBwbGljYXRpb24vcGRmIj48cmVmZXJlbmNlIHZhbHVlPSJBZHZhbmNlRGlyZWN0aXZlLmI1MGI3OTEwLTdmZmItNGY0Yy1iYmU0LTE3N2VkNjhjYmJmMy5wZGYiLz48L3RleHQ+DQoJCQkJPC9leHRlcm5hbERvY3VtZW50Pg0KCQkJPC9yZWZlcmVuY2U+DQoJCTwvb2JzZXJ2YXRpb24+DQoJPC9lbnRyeT4NCjwvc2VjdGlvbj4NCjwvY29tcG9uZW50Pg0KCQkJCQk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCkZ1bmN0aW9uYWwgU3RhdHVzIHNlY3Rpb24NCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqDQotLT4NCjxjb21wb25lbnQ+DQo8c2VjdGlvbj4NCgk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjUnLz4gPCEtLSBGdW5jdGlvbmFsIHN0YXR1cyBzZWN0aW9uIHRlbXBsYXRlIC0tPg0KCTxjb2RlIGNvZGU9IjQ3NDIwLTUiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIvPiANCgk8dGl0bGU+RnVuY3Rpb25hbCBTdGF0dXM8L3RpdGxlPiANCgk8dGV4dD4NCgkJPHRhYmxlIGJvcmRlcj0iMSIgd2lkdGg9IjEwMCUiPg0KCQkJPHRoZWFkPg0KCQkJPHRyPjx0aD5GdW5jdGlvbmFsIENvbmRpdGlvbjwvdGg+IDx0aD5FZmZlY3RpdmUgRGF0ZXM8L3RoPiA8dGg+Q29uZGl0aW9uIFN0YXR1czwvdGg+PC90cj4NCgkJCTwvdGhlYWQ+DQoJCQk8dGJvZHk+DQoJCQk8dHI+PHRkPkRlcGVuZGVuY2Ugb24gY2FuZTwvdGQ+PHRkPjE5OTg8L3RkPjx0ZD5BY3RpdmU8L3RkPjwvdHI+DQoJCQk8dHI+PHRkPk1lbW9yeSBpbXBhaXJtZW50PC90ZD48dGQ+MTk5OTwvdGQ+PHRkPkFjdGl2ZTwvdGQ+PC90cj4NCgkJCTwvdGJvZHk+DQoJCTwvdGFibGU+DQoJPC90ZXh0Pg0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yNycvPiA8IS0tIFByb2JsZW0gYWN0IHRlbXBsYXRlIC0tPg0KCQkJPGlkIHJvb3Q9IjZ6MmZhODhkLTQxNzQtNDkwOS1hZWNlLWRiNDRiNjBhM2FiYiIvPg0KCQkJPGNvZGUgbnVsbEZsYXZvcj0iTkEiLz4NCgkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiI+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yOCcvPiA8IS0tIFByb2JsZW0gb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCTxpZCByb290PSJmZDA3MTExYS1iMTViLTRkY2UtODUxOC0xMjc0ZDA3ZjE0MmEiLz4NCgkJCQkJPGNvZGUgY29kZT0iQVNTRVJUSU9OIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+IA0KCQkJCQk8ZWZmZWN0aXZlVGltZT48bG93IHZhbHVlPSIxOTk4Ii8+PC9lZmZlY3RpdmVUaW1lPg0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSIxMDU1MDQwMDIiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJEZXBlbmRlbmNlIG9uIGNhbmUiLz4NCgkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJSRUZSIj4NCgkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS40NCcvPiA8IS0tIFN0YXR1cyBvZiBmdW5jdGlvbmFsIHN0YXR1cyBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJCQk8Y29kZSBjb2RlPSIzMzk5OS00IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGRpc3BsYXlOYW1lPSJTdGF0dXMiLz4NCgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4gDQoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRSIgY29kZT0iNTU1NjEwMDMiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJBY3RpdmUiLz4NCgkJCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCTwvYWN0PgkNCgk8L2VudHJ5Pg0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yNycvPiA8IS0tIFByb2JsZW0gYWN0IHRlbXBsYXRlIC0tPg0KCQkJPGlkIHJvb3Q9IjY0NjA2ZTg2LWMwODAtMTFkYi04MzE0LTA4MDAyMDBjOWE2NiIvPg0KCQkJPGNvZGUgbnVsbEZsYXZvcj0iTkEiLz4NCgkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiI+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yOCcvPiA8IS0tIFByb2JsZW0gb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCTxpZCByb290PSI2YmUyOTMwYS1jMDgwLTExZGItODMxNC0wODAwMjAwYzlhNjYiLz4NCgkJCQkJPGNvZGUgY29kZT0iQVNTRVJUSU9OIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+IA0KCQkJCQk8ZWZmZWN0aXZlVGltZT48bG93IHZhbHVlPSIxOTk5Ii8+PC9lZmZlY3RpdmVUaW1lPg0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSIzODY4MDcwMDYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJNZW1vcnkgaW1wYWlybWVudCIvPg0KCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlJFRlIiPg0KCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjQ0Jy8+IDwhLS0gU3RhdHVzIG9mIGZ1bmN0aW9uYWwgc3RhdHVzIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQkJCTxjb2RlIGNvZGU9IjMzOTk5LTQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIgZGlzcGxheU5hbWU9IlN0YXR1cyIvPg0KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPiANCgkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNFIiBjb2RlPSI1NTU2MTAwMyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkFjdGl2ZSIvPg0KCQkJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJPC9hY3Q+CQ0KCTwvZW50cnk+DQo8L3NlY3Rpb24+DQo8L2NvbXBvbmVudD4NCgkJCTwhLS0gDQoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KUHJvYmxlbXMgc2VjdGlvbg0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCi0tPg0KPGNvbXBvbmVudD4NCjxzZWN0aW9uPg0KCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMTEnLz4gPCEtLSBQcm9ibGVtIHNlY3Rpb24gdGVtcGxhdGUgLS0+DQoJPGNvZGUgY29kZT0iMTE0NTAtNCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+IA0KCTx0aXRsZT5Qcm9ibGVtczwvdGl0bGU+IA0KCTx0ZXh0Pg0KCQk8dGFibGUgYm9yZGVyPSIxIiB3aWR0aD0iMTAwJSI+DQoJCQk8dGhlYWQ+DQoJCQkJPHRyPjx0aD5Db25kaXRpb248L3RoPjx0aD5FZmZlY3RpdmUgRGF0ZXM8L3RoPjx0aD5Db25kaXRpb24gU3RhdHVzPC90aD48L3RyPg0KCQkJPC90aGVhZD4NCgkJCTx0Ym9keT4NCgkJCQk8dHI+PHRkPkFzdGhtYTwvdGQ+PHRkPjE5NTA8L3RkPjx0ZD5BY3RpdmU8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5QbmV1bW9uaWE8L3RkPjx0ZD5KYW4gMTk5NzwvdGQ+PHRkPlJlc29sdmVkPC90ZD48L3RyPg0KCQkJCTx0cj48dGQ+IjwvdGQ+PHRkPk1hciAxOTk5PC90ZD48dGQ+UmVzb2x2ZWQ8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5NeW9jYXJkaWFsIEluZmFyY3Rpb248L3RkPjx0ZD5KYW4gMTk5NzwvdGQ+PHRkPlJlc29sdmVkPC90ZD48L3RyPgkJCQ0KCQkJPC90Ym9keT4NCgkJPC90YWJsZT4NCgk8L3RleHQ+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPGFjdCBjbGFzc0NvZGU9IkFDVCIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI3Jy8+IDwhLS0gUHJvYmxlbSBhY3QgdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iNmEyZmE4OGQtNDE3NC00OTA5LWFlY2UtZGI0NGI2MGEzYWJiIi8+DQoJCQk8Y29kZSBudWxsRmxhdm9yPSJOQSIvPg0KCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIj4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI4Jy8+IDwhLS0gUHJvYmxlbSBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9ImQxMTI3NWU3LTY3YWUtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPgkJCQkJDQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPiANCgkJCQkJPGVmZmVjdGl2ZVRpbWU+PGxvdyB2YWx1ZT0iMTk1MCIvPjwvZWZmZWN0aXZlVGltZT4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iMTk1OTY3MDAxIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQXN0aG1hIi8+DQoJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUkVGUiI+DQoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTAnLz4gPCEtLSBQcm9ibGVtIHN0YXR1cyBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJCQk8Y29kZSBjb2RlPSIzMzk5OS00IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGRpc3BsYXlOYW1lPSJTdGF0dXMiLz4NCgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNFIiBjb2RlPSI1NTU2MTAwMyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkFjdGl2ZSIvPg0KCQkJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJPC9hY3Q+CQ0KCTwvZW50cnk+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPGFjdCBjbGFzc0NvZGU9IkFDVCIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI3Jy8+IDwhLS0gUHJvYmxlbSBhY3QgdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iZWM4YTZmZjgtZWQ0Yi00ZjdlLTgyYzMtZTk4ZTU4YjQ1ZGU3Ii8+DQoJCQk8Y29kZSBudWxsRmxhdm9yPSJOQSIvPg0KCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIj4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI4Jy8+IDwhLS0gUHJvYmxlbSBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9ImFiMTc5MWIwLTVjNzEtMTFkYi1iMGRlLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPg0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4gDQoJCQkJCTxlZmZlY3RpdmVUaW1lPjxsb3cgdmFsdWU9IjE5OTcwMSIvPjwvZWZmZWN0aXZlVGltZT4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iMjMzNjA0MDA3IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iUG5ldW1vbmlhIi8+DQoJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUkVGUiI+DQoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTAnLz4gPCEtLSBQcm9ibGVtIHN0YXR1cyBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJCQk8Y29kZSBjb2RlPSIzMzk5OS00IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGRpc3BsYXlOYW1lPSJTdGF0dXMiLz4NCgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNFIiBjb2RlPSI0MTMzMjIwMDkiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJSZXNvbHZlZCIvPg0KCQkJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJPC9hY3Q+DQoJPC9lbnRyeT4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8YWN0IGNsYXNzQ29kZT0iQUNUIiBtb29kQ29kZT0iRVZOIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMjcnLz4gPCEtLSBQcm9ibGVtIGFjdCB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSJkMTEyNzVlOS02N2FlLTExZGItYmQxMy0wODAwMjAwYzlhNjYiLz4NCgkJCTxjb2RlIG51bGxGbGF2b3I9Ik5BIi8+DQoJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlNVQkoiPg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMjgnLz4gPCEtLSBQcm9ibGVtIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iOWQzZDQxNmQtNDVhYi00ZGExLTkxMmYtNDU4M2UwNjMyMDAwIi8+DQoJCQkJCTxjb2RlIGNvZGU9IkFTU0VSVElPTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40Ii8+DQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPiANCgkJCQkJPGVmZmVjdGl2ZVRpbWU+PGxvdyB2YWx1ZT0iMTk5OTAzIi8+PC9lZmZlY3RpdmVUaW1lPg0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSIyMzM2MDQwMDciIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJQbmV1bW9uaWEiLz4NCgkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJSRUZSIj4NCgkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS41MCcvPiA8IS0tIFByb2JsZW0gc3RhdHVzIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQkJCTxjb2RlIGNvZGU9IjMzOTk5LTQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIgZGlzcGxheU5hbWU9IlN0YXR1cyIvPg0KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0UiIGNvZGU9IjQxMzMyMjAwOSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IlJlc29sdmVkIi8+DQoJCQkJCQk8L29ic2VydmF0aW9uPg0KCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2VudHJ5UmVsYXRpb25zaGlwPg0KCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIiBpbnZlcnNpb25JbmQ9InRydWUiPg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNDEiLz4gPCEtLSBFcGlzb2RlIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPg0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNDA0Njg0MDAzIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQ2xpbmljYWwgZmluZGluZyI+DQoJCQkJCQk8cXVhbGlmaWVyPg0KCQkJCQkJCTxuYW1lIGNvZGU9IjI0NjQ1NjAwMCIgZGlzcGxheU5hbWU9IkVwaXNvZGljaXR5Ii8+DQoJCQkJCQkJPHZhbHVlIGNvZGU9IjI4ODUyNzAwOCIgZGlzcGxheU5hbWU9Ik5ldyBlcGlzb2RlIi8+DQoJCQkJCQk8L3F1YWxpZmllcj4NCgkJCQkJPC92YWx1ZT4NCgkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTQVMiPg0KCQkJCQkJPGFjdCBjbGFzc0NvZGU9IkFDVCIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCQkJPGlkIHJvb3Q9ImVjOGE2ZmY4LWVkNGItNGY3ZS04MmMzLWU5OGU1OGI0NWRlNyIvPg0KCQkJCQkJCTxjb2RlIG51bGxGbGF2b3I9Ik5BIi8+DQoJCQkJCQk8L2FjdD4NCgkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJPC9hY3Q+CQ0KCTwvZW50cnk+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPGFjdCBjbGFzc0NvZGU9IkFDVCIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI3Jy8+IDwhLS0gUHJvYmxlbSBhY3QgdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iNWEyYzkwM2MtYmQ3Ny00YmQxLWFkOWQtNDUyMzgzZmJmZWZhIi8+DQoJCQk8Y29kZSBudWxsRmxhdm9yPSJOQSIvPg0KCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIj4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI4Jy8+IDwhLS0gUHJvYmxlbSBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGNvZGUgY29kZT0iQVNTRVJUSU9OIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+IA0KCQkJCQk8ZWZmZWN0aXZlVGltZT48bG93IHZhbHVlPSIxOTk3MDEiLz48L2VmZmVjdGl2ZVRpbWU+DQoJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjIyMjk4MDA2IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iTXlvY2FyZGlhbCBpbmZhcmN0aW9uIi8+DQoJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUkVGUiI+DQoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTAnLz4gPCEtLSBQcm9ibGVtIHN0YXR1cyBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJCQk8Y29kZSBjb2RlPSIzMzk5OS00IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGRpc3BsYXlOYW1lPSJTdGF0dXMiLz4NCgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNFIiBjb2RlPSI0MTMzMjIwMDkiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJSZXNvbHZlZCIvPg0KCQkJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJPC9hY3Q+CQ0KCTwvZW50cnk+CQ0KPC9zZWN0aW9uPg0KPC9jb21wb25lbnQ+DQoJCQk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCkZhbWlseSBIaXN0b3J5IHNlY3Rpb24NCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqDQotLT4NCjxjb21wb25lbnQ+DQo8c2VjdGlvbj4NCgk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjQiLz4gPCEtLSBGYW1pbHkgaGlzdG9yeSBzZWN0aW9uIHRlbXBsYXRlIC0tPg0KCTxjb2RlIGNvZGU9IjEwMTU3LTYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIvPg0KCTx0aXRsZT5GYW1pbHkgaGlzdG9yeTwvdGl0bGU+DQoJPHRleHQ+DQoJCTxwYXJhZ3JhcGg+RmF0aGVyIChkZWNlYXNlZCk8L3BhcmFncmFwaD4NCgkJPHRhYmxlIGJvcmRlcj0iMSIgd2lkdGg9IjEwMCUiPg0KCQkJPHRoZWFkPg0KCQkJCTx0cj48dGg+RGlhZ25vc2lzPC90aD48dGg+QWdlIEF0IE9uc2V0PC90aD48L3RyPg0KCQkJPC90aGVhZD4NCgkJCTx0Ym9keT4NCgkJCQk8dHI+PHRkPk15b2NhcmRpYWwgSW5mYXJjdGlvbiAoY2F1c2Ugb2YgZGVhdGgpPC90ZD48dGQ+NTc8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5IeXBlcnRlbnNpb248L3RkPjx0ZD40MDwvdGQ+PC90cj4NCgkJCTwvdGJvZHk+DQoJCTwvdGFibGU+DQoJCTxwYXJhZ3JhcGg+TW90aGVyIChhbGl2ZSk8L3BhcmFncmFwaD4NCgkJPHRhYmxlIGJvcmRlcj0iMSIgd2lkdGg9IjEwMCUiPg0KCQkJPHRoZWFkPg0KCQkJCTx0cj48dGg+RGlhZ25vc2lzPC90aD48dGg+QWdlIEF0IE9uc2V0PC90aD48L3RyPg0KCQkJPC90aGVhZD4NCgkJCTx0Ym9keT4NCgkJCQk8dHI+PHRkPkFzdGhtYTwvdGQ+PHRkPjMwPC90ZD48L3RyPg0KCQkJPC90Ym9keT4NCgkJPC90YWJsZT4NCgk8L3RleHQ+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPG9yZ2FuaXplciBtb29kQ29kZT0iRVZOIiBjbGFzc0NvZGU9IkNMVVNURVIiPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yMyIvPiA8IS0tIEZhbWlseSBoaXN0b3J5IG9yZ2FuaXplciB0ZW1wbGF0ZSAtLT4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJPHN1YmplY3Q+DQoJCQkJPHJlbGF0ZWRTdWJqZWN0IGNsYXNzQ29kZT0iUFJTIj4NCgkJCQkJPGNvZGUgY29kZT0iOTk0NzAwOCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkJpb2xvZ2ljYWwgZmF0aGVyIi8+DQoJCQkJCTxzdWJqZWN0Pg0KCQkJCQkJPGFkbWluaXN0cmF0aXZlR2VuZGVyQ29kZSBjb2RlPSJNIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjEiIGRpc3BsYXlOYW1lPSJNYWxlIi8+DQoJCQkJCQk8YmlydGhUaW1lIHZhbHVlPSIxOTEyIi8+DQoJCQkJCTwvc3ViamVjdD4NCgkJCQk8L3JlbGF0ZWRTdWJqZWN0Pg0KCQkJPC9zdWJqZWN0Pg0KCQkJPGNvbXBvbmVudD4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjQyIi8+IDwhLS0gRmFtaWx5IGhpc3RvcnkgY2F1c2Ugb2YgZGVhdGggb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCTxpZCByb290PSJkNDJlYmY3MC01Yzg5LTExZGItYjBkZS0wODAwMjAwYzlhNjYiLz4NCgkJCQkJPGNvZGUgY29kZT0iQVNTRVJUSU9OIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiLz4JCQ0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4JCQkJCQkNCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iMjIyOTgwMDYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJNSSIvPg0KCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IkNBVVMiPg0KCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJCQk8aWQgcm9vdD0iNjg5OGZhZTAtNWM4YS0xMWRiLWIwZGUtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCQkJPGNvZGUgY29kZT0iQVNTRVJUSU9OIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjQiLz4NCgkJCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSI0MTkwOTkwMDkiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJEZWFkIi8+DQoJCQkJCQk8L29ic2VydmF0aW9uPg0KCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPg0KCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlNVQkoiIGludmVyc2lvbkluZD0idHJ1ZSI+DQoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzgiLz4gPCEtLSBBZ2Ugb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCQkJPGNvZGUgY29kZT0iMzk3NjU5MDA4IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQWdlIi8+DQoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJJTlQiIHZhbHVlPSI1NyIvPg0KCQkJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCQkJPC9lbnRyeVJlbGF0aW9uc2hpcD4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9jb21wb25lbnQ+DQoJCQk8Y29tcG9uZW50Pg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMjIiLz4gPCEtLSBGYW1pbHkgaGlzdG9yeSBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9IjViZmUzZWMwLTVjOGItMTFkYi1iMGRlLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPg0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNTk2MjEwMDAiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJIVE4iLz4NCgkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIiBpbnZlcnNpb25JbmQ9InRydWUiPg0KCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjM4Ii8+IDwhLS0gQWdlIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQkJCTxjb2RlIGNvZGU9IjM5NzY1OTAwOCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkFnZSIvPg0KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iSU5UIiB2YWx1ZT0iNDAiLz4NCgkJCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvY29tcG9uZW50Pg0KCQk8L29yZ2FuaXplcj4NCgk8L2VudHJ5Pg0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxvcmdhbml6ZXIgbW9vZENvZGU9IkVWTiIgY2xhc3NDb2RlPSJDTFVTVEVSIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMjMiLz4gPCEtLSBGYW1pbHkgaGlzdG9yeSBvcmdhbml6ZXIgdGVtcGxhdGUgLS0+DQoJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCTxzdWJqZWN0Pg0KCQkJCTxyZWxhdGVkU3ViamVjdCBjbGFzc0NvZGU9IlBSUyI+DQoJCQkJCTxjb2RlIGNvZGU9IjY1NjU2MDA1IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQmlvbG9naWNhbCBtb3RoZXIiLz4NCgkJCQkJPHN1YmplY3Q+DQoJCQkJCQk8YWRtaW5pc3RyYXRpdmVHZW5kZXJDb2RlIGNvZGU9IkYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuMSIgZGlzcGxheU5hbWU9IkZlbWFsZSIvPg0KCQkJCQkJPGJpcnRoVGltZSB2YWx1ZT0iMTkxMiIvPg0KCQkJCQk8L3N1YmplY3Q+DQoJCQkJPC9yZWxhdGVkU3ViamVjdD4NCgkJCTwvc3ViamVjdD4NCgkJCTxjb21wb25lbnQ+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yMiIvPiA8IS0tIEZhbWlseSBoaXN0b3J5IG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iYTEzYzYxNjAtNWM4Yi0xMWRiLWIwZGUtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IkFTU0VSVElPTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40Ii8+CQkJCQkJCQkNCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCTxlZmZlY3RpdmVUaW1lPg0KCQkJCQkJPGxvdyB2YWx1ZT0iMTk0MiIvPg0KCQkJCQk8L2VmZmVjdGl2ZVRpbWU+DQoJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjE5NTk2NzAwMSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkFzdGhtYSIvPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2NvbXBvbmVudD4NCgkJPC9vcmdhbml6ZXI+DQoJPC9lbnRyeT4NCjwvc2VjdGlvbj4NCjwvY29tcG9uZW50Pg0KCQkJPCEtLSANCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqDQpTb2NpYWwgSGlzdG9yeSBzZWN0aW9uDQoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KLS0+DQo8Y29tcG9uZW50Pg0KPHNlY3Rpb24+DQoJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4xNSIvPiA8IS0tIFNvY2lhbCBoaXN0b3J5IHNlY3Rpb24gdGVtcGxhdGUgLS0+DQoJPGNvZGUgY29kZT0iMjk3NjItMiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+IA0KCTx0aXRsZT5Tb2NpYWwgSGlzdG9yeTwvdGl0bGU+IA0KCTx0ZXh0Pg0KCQk8dGFibGUgYm9yZGVyPSIxIiB3aWR0aD0iMTAwJSI+DQoJCQk8dGhlYWQ+DQoJCQkJPHRyPjx0aD5Tb2NpYWwgSGlzdG9yeSBFbGVtZW50PC90aD48dGg+RGVzY3JpcHRpb248L3RoPjx0aD5FZmZlY3RpdmUgRGF0ZXM8L3RoPjwvdHI+DQoJCQk8L3RoZWFkPg0KCQkJPHRib2R5Pg0KCQkJCTx0cj48dGQ+Q2lnYXJldHRlIHNtb2tpbmc8L3RkPjx0ZD4xIHBhY2sgcGVyIGRheTwvdGQ+PHRkPjE5NDcgLSAxOTcyPC90ZD48L3RyPg0KCQkJCTx0cj48dGQ+IjwvdGQ+PHRkPk5vbmU8L3RkPjx0ZD4xOTczIC0gPC90ZD48L3RyPg0KCQkJCTx0cj48dGQ+QWxjb2hvbCBjb25zdW1wdGlvbjwvdGQ+PHRkPk5vbmU8L3RkPjx0ZD4xOTczIC0gPC90ZD48L3RyPgkJCQ0KCQkJPC90Ym9keT4NCgkJPC90YWJsZT4NCgk8L3RleHQ+CQ0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMzIi8+IDwhLS0gU29jaWFsIGhpc3Rvcnkgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iOWI1NmMyNWQtOTEwNC00NWVlLTlmYTQtZTBmM2FmYWEwMWMxIi8+DQoJCQk8Y29kZSBjb2RlPSIyMzAwNTYwMDQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJDaWdhcmV0dGUgc21va2luZyIvPg0KCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+IA0KCQkJPGVmZmVjdGl2ZVRpbWU+PGxvdyB2YWx1ZT0iMTk0NyIvPjxoaWdoIHZhbHVlPSIxOTcyIi8+PC9lZmZlY3RpdmVUaW1lPg0KCQkJPHZhbHVlIHhzaTp0eXBlPSJTVCI+MSBwYWNrIHBlciBkYXk8L3ZhbHVlPg0KCQk8L29ic2VydmF0aW9uPg0KCTwvZW50cnk+CQ0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMzIi8+IDwhLS0gU29jaWFsIGhpc3Rvcnkgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iNDVlZmI2MDQtNzA0OS00YTJlLWFkMzMtZDM4NTU2Yzk2MzZjIi8+DQoJCQk8Y29kZSBjb2RlPSIyMzAwNTYwMDQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJDaWdhcmV0dGUgc21va2luZyIvPg0KCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+IA0KCQkJPGVmZmVjdGl2ZVRpbWU+PGxvdyB2YWx1ZT0iMTk3MyIvPjwvZWZmZWN0aXZlVGltZT4NCgkJCTx2YWx1ZSB4c2k6dHlwZT0iU1QiPk5vbmU8L3ZhbHVlPg0KCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTVUJKIiBpbnZlcnNpb25JbmQ9InRydWUiPg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNDEiLz4gPCEtLSBFcGlzb2RlIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPg0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNDA0Njg0MDAzIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQ2xpbmljYWwgZmluZGluZyI+DQoJCQkJCQk8cXVhbGlmaWVyPg0KCQkJCQkJCTxuYW1lIGNvZGU9IjI0NjQ1NjAwMCIgZGlzcGxheU5hbWU9IkVwaXNvZGljaXR5Ii8+DQoJCQkJCQkJPHZhbHVlIGNvZGU9IjI4ODUyNzAwOCIgZGlzcGxheU5hbWU9Ik5ldyBlcGlzb2RlIi8+DQoJCQkJCQk8L3F1YWxpZmllcj4NCgkJCQkJPC92YWx1ZT4NCgkJCQkJPGVudHJ5UmVsYXRpb25zaGlwIHR5cGVDb2RlPSJTQVMiPg0KCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJCQk8aWQgcm9vdD0iOWI1NmMyNWQtOTEwNC00NWVlLTlmYTQtZTBmM2FmYWEwMWMxIi8+DQoJCQkJCQkJPGNvZGUgY29kZT0iMjMwMDU2MDA0IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQ2lnYXJldHRlIHNtb2tpbmciLz4NCgkJCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCTwvb2JzZXJ2YXRpb24+DQoJPC9lbnRyeT4JDQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzMiLz4gPCEtLSBTb2NpYWwgaGlzdG9yeSBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSIzN2Y3NmM1MS02NDExLTRlMWQtOGEzNy05NTdmZDQ5ZDJjZWYiLz4NCgkJCTxjb2RlIGNvZGU9IjE2MDU3MzAwMyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkFsY29ob2wgY29uc3VtcHRpb24iLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPiANCgkJCTxlZmZlY3RpdmVUaW1lPjxsb3cgdmFsdWU9IjE5NzMiLz48L2VmZmVjdGl2ZVRpbWU+DQoJCQk8dmFsdWUgeHNpOnR5cGU9IlNUIj5Ob25lPC92YWx1ZT4NCgkJPC9vYnNlcnZhdGlvbj4NCgk8L2VudHJ5PgkNCjwvc2VjdGlvbj4NCjwvY29tcG9uZW50Pg0KCQkJPCEtLSANCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqDQpBbGVydHMgc2VjdGlvbg0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCi0tPg0KPGNvbXBvbmVudD4NCjxzZWN0aW9uPg0KCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMiIvPiA8IS0tIEFsZXJ0cyBzZWN0aW9uIHRlbXBsYXRlIC0tPg0KCTxjb2RlIGNvZGU9IjQ4NzY1LTIiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIvPg0KCTx0aXRsZT5BbGxlcmdpZXMsIEFkdmVyc2UgUmVhY3Rpb25zLCBBbGVydHM8L3RpdGxlPg0KCTx0ZXh0Pg0KCQk8dGFibGUgYm9yZGVyPSIxIiB3aWR0aD0iMTAwJSI+DQoJCQk8dGhlYWQ+DQoJCQkJPHRyPjx0aD5TdWJzdGFuY2U8L3RoPjx0aD5SZWFjdGlvbjwvdGg+PHRoPlN0YXR1czwvdGg+PC90cj4NCgkJCTwvdGhlYWQ+DQoJCQk8dGJvZHk+DQoJCQkJPHRyPjx0ZD5QZW5pY2lsbGluPC90ZD48dGQ+SGl2ZXM8L3RkPjx0ZD5BY3RpdmU8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5Bc3BpcmluPC90ZD48dGQ+V2hlZXppbmc8L3RkPjx0ZD5BY3RpdmU8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5Db2RlaW5lPC90ZD48dGQ+TmF1c2VhPC90ZD48dGQ+QWN0aXZlPC90ZD48L3RyPg0KCQkJPC90Ym9keT4NCgkJPC90YWJsZT4NCgk8L3RleHQ+CQ0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yNycvPiA8IS0tIFByb2JsZW0gYWN0IHRlbXBsYXRlIC0tPg0KCQkJPGlkIHJvb3Q9IjM2ZTNlOTMwLTdiMTQtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPg0KCQkJPGNvZGUgbnVsbEZsYXZvcj0iTkEiLz4NCgkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiI+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4xOCcvPiA8IS0tIEFsZXJ0IG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iNGFkYzEwMjAtN2IxNC0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IkFTU0VSVElPTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40Ii8+CQkJCQkNCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+IA0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSIyODIxMDAwMDkiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJBZHZlcnNlIHJlYWN0aW9uIHRvIHN1YnN0YW5jZSIvPg0KCQkJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IkNTTSI+DQoJCQkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iTUFOVSI+DQoJCQkJCQkJPHBsYXlpbmdFbnRpdHkgY2xhc3NDb2RlPSJNTUFUIj4NCgkJCQkJCQkJPGNvZGUgY29kZT0iNzA2MTgiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuODgiICBkaXNwbGF5TmFtZT0iUGVuaWNpbGxpbiIvPg0KCQkJCQkJCTwvcGxheWluZ0VudGl0eT4NCgkJCQkJCTwvcGFydGljaXBhbnRSb2xlPg0KCQkJCQk8L3BhcnRpY2lwYW50Pg0KCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9Ik1GU1QiIGludmVyc2lvbkluZD0idHJ1ZSI+DQoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTQnLz4gPCEtLSBSZWFjdGlvbiBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPg0KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjI0NzQ3MjAwNCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkhpdmVzIi8+DQoJCQkJCQk8L29ic2VydmF0aW9uPg0KCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPg0KCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlJFRlIiPg0KCQkJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJCQk8dGVtcGxhdGVJZCByb290PScyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjM5Jy8+IDwhLS0gQWxlcnQgc3RhdHVzIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQkJCTxjb2RlIGNvZGU9IjMzOTk5LTQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIgZGlzcGxheU5hbWU9IlN0YXR1cyIvPg0KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0UiIGNvZGU9IjU1NTYxMDAzIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQWN0aXZlIi8+DQoJCQkJCQk8L29ic2VydmF0aW9uPg0KCQkJCQk8L2VudHJ5UmVsYXRpb25zaGlwPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2VudHJ5UmVsYXRpb25zaGlwPg0KCQk8L2FjdD4JDQoJPC9lbnRyeT4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8YWN0IGNsYXNzQ29kZT0iQUNUIiBtb29kQ29kZT0iRVZOIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMjcnLz4gPCEtLSBQcm9ibGVtIGFjdCB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSJlYjkzNjAxMC03YjE3LTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4NCgkJCTxjb2RlIG51bGxGbGF2b3I9Ik5BIi8+DQoJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9IlNVQkoiPg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMTgnLz4gPCEtLSBBbGVydCBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9ImViOTM2MDExLTdiMTctMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPgkJCQkJDQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPiANCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iMjgyMTAwMDA5IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQWR2ZXJzZSByZWFjdGlvbiB0byBzdWJzdGFuY2UiLz4NCgkJCQkJPHBhcnRpY2lwYW50IHR5cGVDb2RlPSJDU00iPg0KCQkJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9Ik1BTlUiPg0KCQkJCQkJCTxwbGF5aW5nRW50aXR5IGNsYXNzQ29kZT0iTU1BVCI+DQoJCQkJCQkJCTxjb2RlIGNvZGU9IjExOTEiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuODgiICBkaXNwbGF5TmFtZT0iQXNwaXJpbiIvPg0KCQkJCQkJCTwvcGxheWluZ0VudGl0eT4NCgkJCQkJCTwvcGFydGljaXBhbnRSb2xlPg0KCQkJCQk8L3BhcnRpY2lwYW50Pg0KCQkJCQk8ZW50cnlSZWxhdGlvbnNoaXAgdHlwZUNvZGU9Ik1GU1QiIGludmVyc2lvbkluZD0idHJ1ZSI+DQoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTQnLz4gPCEtLSBSZWFjdGlvbiBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPg0KCQkJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iQ0QiIGNvZGU9IjU2MDE4MDA0IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iV2hlZXppbmciLz4NCgkJCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUkVGUiI+DQoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzknLz4gPCEtLSBBbGVydCBzdGF0dXMgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCQkJPGNvZGUgY29kZT0iMzM5OTktNCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBkaXNwbGF5TmFtZT0iU3RhdHVzIi8+DQoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRSIgY29kZT0iNTU1NjEwMDMiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJBY3RpdmUiLz4NCgkJCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCTwvYWN0PgkNCgk8L2VudHJ5Pg0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxhY3QgY2xhc3NDb2RlPSJBQ1QiIG1vb2RDb2RlPSJFVk4iPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yNycvPiA8IS0tIFByb2JsZW0gYWN0IHRlbXBsYXRlIC0tPg0KCQkJPGlkIHJvb3Q9ImMzZGYzYjYxLTdiMTgtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPg0KCQkJPGNvZGUgbnVsbEZsYXZvcj0iTkEiLz4NCgkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iU1VCSiI+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4xOCcvPiA8IS0tIEFsZXJ0IG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iYzNkZjNiNjAtN2IxOC0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IkFTU0VSVElPTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40Ii8+CQkJCQkNCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+IA0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNEIiBjb2RlPSIyODIxMDAwMDkiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJBZHZlcnNlIHJlYWN0aW9uIHRvIHN1YnN0YW5jZSIvPg0KCQkJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IkNTTSI+DQoJCQkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iTUFOVSI+DQoJCQkJCQkJPHBsYXlpbmdFbnRpdHkgY2xhc3NDb2RlPSJNTUFUIj4NCgkJCQkJCQkJPGNvZGUgY29kZT0iMjY3MCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi44OCIgIGRpc3BsYXlOYW1lPSJDb2RlaW5lIi8+DQoJCQkJCQkJPC9wbGF5aW5nRW50aXR5Pg0KCQkJCQkJPC9wYXJ0aWNpcGFudFJvbGU+DQoJCQkJCTwvcGFydGljaXBhbnQ+DQoJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iTUZTVCIgaW52ZXJzaW9uSW5kPSJ0cnVlIj4NCgkJCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCQkJPHRlbXBsYXRlSWQgcm9vdD0nMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS41NCcvPiA8IS0tIFJlYWN0aW9uIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQkJCTxjb2RlIGNvZGU9IkFTU0VSVElPTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40Ii8+DQoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRCIgY29kZT0iNzM4NzkwMDciIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJOYXVzZWEiLz4NCgkJCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCQkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUkVGUiI+DQoJCQkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9JzIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzknLz4gPCEtLSBBbGVydCBzdGF0dXMgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCQkJPGNvZGUgY29kZT0iMzM5OTktNCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBkaXNwbGF5TmFtZT0iU3RhdHVzIi8+DQoJCQkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRSIgY29kZT0iNTU1NjEwMDMiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJBY3RpdmUiLz4NCgkJCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvZW50cnlSZWxhdGlvbnNoaXA+DQoJCTwvYWN0PgkNCgk8L2VudHJ5Pg0KPC9zZWN0aW9uPg0KPC9jb21wb25lbnQ+DQoJCQk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCk1lZGljYXRpb25zIHNlY3Rpb24NCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqDQotLT4NCjxjb21wb25lbnQ+DQo8c2VjdGlvbj4NCgk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjgiLz4gPCEtLSBNZWRpY2F0aW9ucyBzZWN0aW9uIHRlbXBsYXRlIC0tPg0KCTxjb2RlIGNvZGU9IjEwMTYwLTAiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIvPg0KCTx0aXRsZT5NZWRpY2F0aW9uczwvdGl0bGU+DQoJPHRleHQ+DQoJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4NCgkJCTx0aGVhZD4NCgkJCQk8dHI+PHRoPk1lZGljYXRpb248L3RoPjx0aD5JbnN0cnVjdGlvbnM8L3RoPjx0aD5TdGFydCBEYXRlPC90aD48dGg+U3RhdHVzPC90aD48L3RyPg0KCQkJPC90aGVhZD4NCgkJCTx0Ym9keT4NCgkJCQk8dHI+PHRkPkFsYnV0ZXJvbCBpbmhhbGFudDwvdGQ+PHRkPjIgcHVmZnMgUUlEIFBSTiB3aGVlemluZzwvdGQ+PHRkPiYjMTYwOzwvdGQ+PHRkPkFjdGl2ZTwvdGQ+PC90cj4NCgkJCQk8dHI+PHRkPkNsb3BpZG9ncmVsIChQbGF2aXgpPC90ZD48dGQ+NzVtZyBQTyBkYWlseTwvdGQ+PHRkPiYjMTYwOzwvdGQ+PHRkPkFjdGl2ZTwvdGQ+PC90cj4NCgkJCQk8dHI+PHRkPk1ldG9wcm9sb2w8L3RkPjx0ZD4yNW1nIFBPIEJJRDwvdGQ+PHRkPiYjMTYwOzwvdGQ+PHRkPkFjdGl2ZTwvdGQ+PC90cj4NCgkJCQk8dHI+PHRkPlByZWRuaXNvbmU8L3RkPjx0ZD4yMG1nIFBPIGRhaWx5PC90ZD48dGQ+TWFyIDI4LCAyMDAwPC90ZD48dGQ+QWN0aXZlPC90ZD48L3RyPg0KCQkJCTx0cj48dGQ+Q2VwaGFsZXhpbiAoS2VmbGV4KTwvdGQ+PHRkPjUwMG1nIFBPIFFJRCB4IDcgZGF5cyAoZm9yIGJyb25jaGl0aXMpPC90ZD48dGQ+TWFyIDI4LCAyMDAwPC90ZD48dGQ+Tm8gbG9uZ2VyIGFjdGl2ZTwvdGQ+PC90cj4NCgkJCTwvdGJvZHk+DQoJCTwvdGFibGU+DQoJPC90ZXh0Pg0KCQk8aW5mb3JtYW50Pg0KCQk8YXNzaWduZWRFbnRpdHk+DQoJCQk8aWQgZXh0ZW5zaW9uPSI5OTYtNzU2LTQ5NSIgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTkuNSIvPg0KCQkJPHJlcHJlc2VudGVkT3JnYW5pemF0aW9uPg0KCQkJCTxpZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xOS41Ii8+DQoJCQkJPG5hbWU+R29vZCBIZWFsdGggQ2xpbmljPC9uYW1lPg0KCQkJPC9yZXByZXNlbnRlZE9yZ2FuaXphdGlvbj4NCgkJPC9hc3NpZ25lZEVudGl0eT4NCgk8L2luZm9ybWFudD4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8c3Vic3RhbmNlQWRtaW5pc3RyYXRpb24gY2xhc3NDb2RlPSJTQkFETSIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI0Ii8+IDwhLS0gTWVkaWNhdGlvbiBhY3Rpdml0eSB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSJjZGJkMzNmMC02Y2RlLTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImFjdGl2ZSIvPg0KCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IlBJVkxfVFMiPg0KCQkJCTxwZXJpb2QgdmFsdWU9IjYiIHVuaXQ9ImgiLz4NCgkJCTwvZWZmZWN0aXZlVGltZT4NCgkJCTxyb3V0ZUNvZGUgY29kZT0iSVBJTkhMIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjExMiIgY29kZVN5c3RlbU5hbWU9IlJvdXRlT2ZBZG1pbmlzdHJhdGlvbiIgZGlzcGxheU5hbWU9IkluaGFsYXRpb24sIG9yYWwiLz4NCgkJCTxkb3NlUXVhbnRpdHkgdmFsdWU9IjIiLz4NCgkJCTxhZG1pbmlzdHJhdGlvblVuaXRDb2RlIGNvZGU9IjQxNTIxNTAwMSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IlB1ZmYiLz4NCgkJCTxjb25zdW1hYmxlPg0KCQkJCTxtYW51ZmFjdHVyZWRQcm9kdWN0Pg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjUzIi8+IDwhLS0gUHJvZHVjdCB0ZW1wbGF0ZSAtLT4NCgkJCQkJPG1hbnVmYWN0dXJlZE1hdGVyaWFsPg0KCQkJCQkJPGNvZGUgY29kZT0iMzA3NzgyIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljg4IiAgZGlzcGxheU5hbWU9IkFsYnV0ZXJvbCAwLjA5IE1HL0FDVFVBVCBpbmhhbGFudCBzb2x1dGlvbiI+DQoJCQkJCQkJPG9yaWdpbmFsVGV4dD5BbGJ1dGVyb2wgaW5oYWxhbnQ8L29yaWdpbmFsVGV4dD4NCgkJCQkJCTwvY29kZT4NCgkJCQkJPC9tYW51ZmFjdHVyZWRNYXRlcmlhbD4NCgkJCQk8L21hbnVmYWN0dXJlZFByb2R1Y3Q+DQoJCQk8L2NvbnN1bWFibGU+DQoJCQk8cHJlY29uZGl0aW9uIHR5cGVDb2RlPSJQUkNOIj4NCgkJCQk8Y3JpdGVyaW9uPg0KCQkJCQk8Y29kZSBjb2RlPSJBU1NFUlRJT04iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIvPg0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IkNFIiBjb2RlPSI1NjAxODAwNCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgIGRpc3BsYXlOYW1lPSJXaGVlemluZyIvPg0KCQkJCTwvY3JpdGVyaW9uPg0KCQkJPC9wcmVjb25kaXRpb24+DQoJCTwvc3Vic3RhbmNlQWRtaW5pc3RyYXRpb24+DQoJPC9lbnRyeT4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8c3Vic3RhbmNlQWRtaW5pc3RyYXRpb24gY2xhc3NDb2RlPSJTQkFETSIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI0Ii8+IDwhLS0gTWVkaWNhdGlvbiBhY3Rpdml0eSB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSJjZGJkNWIwNS02Y2RlLTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImFjdGl2ZSIvPg0KCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IlBJVkxfVFMiPg0KCQkJCTxwZXJpb2QgdmFsdWU9IjI0IiB1bml0PSJoIi8+DQoJCQk8L2VmZmVjdGl2ZVRpbWU+DQoJCQk8cm91dGVDb2RlIGNvZGU9IlBPIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjExMiIgY29kZVN5c3RlbU5hbWU9IlJvdXRlT2ZBZG1pbmlzdHJhdGlvbiIvPg0KCQkJPGRvc2VRdWFudGl0eSB2YWx1ZT0iMSIvPg0KCQkJPGNvbnN1bWFibGU+DQoJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3Q+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTMiLz4gPCEtLSBQcm9kdWN0IHRlbXBsYXRlIC0tPg0KCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+DQoJCQkJCQk8Y29kZSBjb2RlPSIzMDkzNjIiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuODgiICBkaXNwbGF5TmFtZT0iQ2xvcGlkb2dyZWwgNzUgTUcgb3JhbCB0YWJsZXQiPg0KCQkJCQkJCTxvcmlnaW5hbFRleHQ+Q2xvcGlkb2dyZWw8L29yaWdpbmFsVGV4dD4NCgkJCQkJCTwvY29kZT4NCgkJCQkJCTxuYW1lPlBsYXZpeDwvbmFtZT4NCgkJCQkJPC9tYW51ZmFjdHVyZWRNYXRlcmlhbD4NCgkJCQk8L21hbnVmYWN0dXJlZFByb2R1Y3Q+DQoJCQk8L2NvbnN1bWFibGU+DQoJCTwvc3Vic3RhbmNlQWRtaW5pc3RyYXRpb24+DQoJPC9lbnRyeT4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8c3Vic3RhbmNlQWRtaW5pc3RyYXRpb24gY2xhc3NDb2RlPSJTQkFETSIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI0Ii8+IDwhLS0gTWVkaWNhdGlvbiBhY3Rpdml0eSB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSJjZGJkNWIwMS02Y2RlLTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImFjdGl2ZSIvPg0KCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IlBJVkxfVFMiPg0KCQkJCTxwZXJpb2QgdmFsdWU9IjEyIiB1bml0PSJoIi8+DQoJCQk8L2VmZmVjdGl2ZVRpbWU+DQoJCQk8cm91dGVDb2RlIGNvZGU9IlBPIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjExMiIgY29kZVN5c3RlbU5hbWU9IlJvdXRlT2ZBZG1pbmlzdHJhdGlvbiIvPg0KCQkJPGRvc2VRdWFudGl0eSB2YWx1ZT0iMSIvPg0KCQkJPGNvbnN1bWFibGU+DQoJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3Q+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTMiLz4gPCEtLSBQcm9kdWN0IHRlbXBsYXRlIC0tPg0KCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+DQoJCQkJCQk8Y29kZSBjb2RlPSI0MzA2MTgiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuODgiICBkaXNwbGF5TmFtZT0iTWV0b3Byb2xvbCAyNSBNRyBvcmFsIHRhYmxldCI+DQoJCQkJCQkJPG9yaWdpbmFsVGV4dD5NZXRvcHJvbG9sPC9vcmlnaW5hbFRleHQ+DQoJCQkJCQk8L2NvZGU+DQoJCQkJCTwvbWFudWZhY3R1cmVkTWF0ZXJpYWw+DQoJCQkJPC9tYW51ZmFjdHVyZWRQcm9kdWN0Pg0KCQkJPC9jb25zdW1hYmxlPg0KCQk8L3N1YnN0YW5jZUFkbWluaXN0cmF0aW9uPg0KCTwvZW50cnk+CQkJCQ0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxzdWJzdGFuY2VBZG1pbmlzdHJhdGlvbiBjbGFzc0NvZGU9IlNCQURNIiBtb29kQ29kZT0iRVZOIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMjQiLz4gPCEtLSBNZWRpY2F0aW9uIGFjdGl2aXR5IHRlbXBsYXRlIC0tPg0KCQkJPGlkIHJvb3Q9ImNkYmQ1YjAzLTZjZGUtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPg0KCQkJPHN0YXR1c0NvZGUgY29kZT0iYWN0aXZlIi8+DQoJCQk8ZWZmZWN0aXZlVGltZSB4c2k6dHlwZT0iSVZMX1RTIj4NCgkJCQk8bG93IHZhbHVlPSIyMDAwMDMyOCIvPg0KCQkJPC9lZmZlY3RpdmVUaW1lPg0KCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IlBJVkxfVFMiIG9wZXJhdG9yPSJBIj4NCgkJCQk8cGVyaW9kIHZhbHVlPSIyNCIgdW5pdD0iaCIvPg0KCQkJPC9lZmZlY3RpdmVUaW1lPg0KCQkJPHJvdXRlQ29kZSBjb2RlPSJQTyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS4xMTIiIGNvZGVTeXN0ZW1OYW1lPSJSb3V0ZU9mQWRtaW5pc3RyYXRpb24iLz4NCgkJCTxkb3NlUXVhbnRpdHkgdmFsdWU9IjEiLz4NCgkJCTxjb25zdW1hYmxlPg0KCQkJCTxtYW51ZmFjdHVyZWRQcm9kdWN0Pg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjUzIi8+IDwhLS0gUHJvZHVjdCB0ZW1wbGF0ZSAtLT4NCgkJCQkJPG1hbnVmYWN0dXJlZE1hdGVyaWFsPg0KCQkJCQkJPGNvZGUgY29kZT0iMzEyNjE1IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljg4IiAgZGlzcGxheU5hbWU9IlByZWRuaXNvbmUgMjAgTUcgb3JhbCB0YWJsZXQiPg0KCQkJCQkJCTxvcmlnaW5hbFRleHQ+UHJlZG5pc29uZTwvb3JpZ2luYWxUZXh0Pg0KCQkJCQkJPC9jb2RlPg0KCQkJCQk8L21hbnVmYWN0dXJlZE1hdGVyaWFsPg0KCQkJCTwvbWFudWZhY3R1cmVkUHJvZHVjdD4NCgkJCTwvY29uc3VtYWJsZT4NCgkJPC9zdWJzdGFuY2VBZG1pbmlzdHJhdGlvbj4NCgk8L2VudHJ5Pg0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxzdWJzdGFuY2VBZG1pbmlzdHJhdGlvbiBjbGFzc0NvZGU9IlNCQURNIiBtb29kQ29kZT0iRVZOIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMjQiLz4gPCEtLSBNZWRpY2F0aW9uIGFjdGl2aXR5IHRlbXBsYXRlIC0tPg0KCQkJPGlkIHJvb3Q9ImNkYmQ1YjA3LTZjZGUtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPg0KCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQk8ZWZmZWN0aXZlVGltZSB4c2k6dHlwZT0iSVZMX1RTIj4NCgkJCQk8bG93IHZhbHVlPSIyMDAwMDMyOCIvPg0KCQkJCTxoaWdoIHZhbHVlPSIyMDAwMDQwNCIvPg0KCQkJPC9lZmZlY3RpdmVUaW1lPg0KCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IlBJVkxfVFMiIG9wZXJhdG9yPSJBIj4NCgkJCQk8cGVyaW9kIHZhbHVlPSI2IiB1bml0PSJoIi8+DQoJCQk8L2VmZmVjdGl2ZVRpbWU+DQoJCQk8cm91dGVDb2RlIGNvZGU9IlBPIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjExMiIgY29kZVN5c3RlbU5hbWU9IlJvdXRlT2ZBZG1pbmlzdHJhdGlvbiIvPg0KCQkJPGRvc2VRdWFudGl0eSB2YWx1ZT0iMSIvPg0KCQkJPGNvbnN1bWFibGU+DQoJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3Q+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTMiLz4gPCEtLSBQcm9kdWN0IHRlbXBsYXRlIC0tPg0KCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+DQoJCQkJCQk8Y29kZSBjb2RlPSIxOTc0NTQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuODgiICBkaXNwbGF5TmFtZT0iQ2VwaGFsZXhpbiA1MDAgTUcgb3JhbCB0YWJsZXQiPg0KCQkJCQkJCTxvcmlnaW5hbFRleHQ+Q2VwaGFsZXhpbjwvb3JpZ2luYWxUZXh0Pg0KCQkJCQkJPC9jb2RlPg0KCQkJCQkJPG5hbWU+S2VmbGV4PC9uYW1lPg0KCQkJCQk8L21hbnVmYWN0dXJlZE1hdGVyaWFsPg0KCQkJCTwvbWFudWZhY3R1cmVkUHJvZHVjdD4NCgkJCTwvY29uc3VtYWJsZT4NCgkJCTxlbnRyeVJlbGF0aW9uc2hpcCB0eXBlQ29kZT0iUlNPTiI+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iQ09ORCIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMjgiLz4gPCEtLSBQcm9ibGVtIG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iY2RiZDViMDgtNmNkZS0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IkFTU0VSVElPTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS40Ii8+DQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQk8ZWZmZWN0aXZlVGltZSB4c2k6dHlwZT0iSVZMX1RTIj4NCgkJCQkJCTxsb3cgdmFsdWU9IjIwMDAwMzI4Ii8+DQoJCQkJCTwvZWZmZWN0aXZlVGltZT4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJDRSIgY29kZT0iMzIzOTgwMDQiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiICBkaXNwbGF5TmFtZT0iQnJvbmNoaXRpcyIvPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2VudHJ5UmVsYXRpb25zaGlwPg0KCQk8L3N1YnN0YW5jZUFkbWluaXN0cmF0aW9uPg0KCTwvZW50cnk+DQo8L3NlY3Rpb24+DQo8L2NvbXBvbmVudD4NCgkJCTwhLS0gDQoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KTWVkaWNhbCBFcXVpcG1lbnQgc2VjdGlvbg0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCi0tPg0KPGNvbXBvbmVudD4NCjxzZWN0aW9uPg0KCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNyIvPiA8IS0tIE1lZGljYWwgZXF1aXBtZW50IHNlY3Rpb24gdGVtcGxhdGUgLS0+DQoJPGNvZGUgY29kZT0iNDYyNjQtOCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+DQoJPHRpdGxlPk1lZGljYWwgRXF1aXBtZW50PC90aXRsZT4NCgk8dGV4dD4NCgkJPHRhYmxlIGJvcmRlcj0iMSIgd2lkdGg9IjEwMCUiPg0KCQkJPHRoZWFkPg0KCQkJCTx0cj48dGg+U3VwcGx5L0RldmljZTwvdGg+PHRoPkRhdGUgU3VwcGxpZWQ8L3RoPjwvdHI+DQoJCQk8L3RoZWFkPg0KCQkJPHRib2R5Pg0KCQkJCTx0cj48dGQ+QXV0b21hdGljIGltcGxhbnRhYmxlIGNhcmRpb3ZlcnRlci9kZWZpYnJpbGxhdG9yPC90ZD48dGQ+Tm92IDE5OTk8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5Ub3RhbCBoaXAgcmVwbGFjZW1lbnQgcHJvc3RoZXNpczwvdGQ+PHRkPjE5OTg8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5XaGVlbGNoYWlyPC90ZD48dGQ+MTk5OTwvdGQ+PC90cj4NCgkJCTwvdGJvZHk+DQoJCTwvdGFibGU+DQoJPC90ZXh0Pg0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxzdXBwbHkgY2xhc3NDb2RlPSJTUExZIiBtb29kQ29kZT0iRVZOIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzQiLz4gPCEtLSBTdXBwbHkgYWN0aXZpdHkgdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iMjQxMzc3M2MtMjM3Mi00Mjk5LWJiZTYtNWIwZjYwNjY0NDQ2Ii8+DQoJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCTxlZmZlY3RpdmVUaW1lIHhzaTp0eXBlPSJJVkxfVFMiPjxjZW50ZXIgdmFsdWU9IjE5OTkxMSIvPjwvZWZmZWN0aXZlVGltZT4NCgkJCTxwYXJ0aWNpcGFudCB0eXBlQ29kZT0iREVWIj4NCgkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iTUFOVSI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTIiLz4gPCEtLSBQcm9kdWN0IGluc3RhbmNlIHRlbXBsYXRlIC0tPg0KCQkJCQk8cGxheWluZ0RldmljZT4NCgkJCQkJCTxjb2RlIGNvZGU9IjcyNTA2MDAxIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQXV0b21hdGljIGltcGxhbnRhYmxlIGNhcmRpb3ZlcnRlci9kZWZpYnJpbGxhdG9yIi8+DQoJCQkJCTwvcGxheWluZ0RldmljZT4NCgkJCQk8L3BhcnRpY2lwYW50Um9sZT4NCgkJCTwvcGFydGljaXBhbnQ+DQoJCTwvc3VwcGx5Pg0KCTwvZW50cnk+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPHN1cHBseSBjbGFzc0NvZGU9IlNQTFkiIG1vb2RDb2RlPSJFVk4iPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4zNCIvPiA8IS0tIFN1cHBseSBhY3Rpdml0eSB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSIyMzBiMGFiNy0yMDZkLTQyZDgtYTk0Ny1hYjRmNjNhYWQ3OTUiLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IklWTF9UUyI+PGNlbnRlciB2YWx1ZT0iMTk5OCIvPjwvZWZmZWN0aXZlVGltZT4NCgkJCTxwYXJ0aWNpcGFudCB0eXBlQ29kZT0iREVWIj4NCgkJCQk8cGFydGljaXBhbnRSb2xlIGNsYXNzQ29kZT0iTUFOVSI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTIiLz4gPCEtLSBQcm9kdWN0IGluc3RhbmNlIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iMDNjYTAxYjAtN2JlMS0xMWRiLTlmZTEtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxwbGF5aW5nRGV2aWNlPg0KCQkJCQkJPGNvZGUgY29kZT0iMzA0MTIwMDA3IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iVG90YWwgaGlwIHJlcGxhY2VtZW50IHByb3N0aGVzaXMiLz4NCgkJCQkJPC9wbGF5aW5nRGV2aWNlPg0KCQkJCQk8c2NvcGluZ0VudGl0eT4NCgkJCQkJCTxpZCByb290PSIwYWJlYTk1MC01YjQwLTRiN2UtYjhkOS0yYTVlYTNhYzU1MDAiLz4NCgkJCQkJCTxkZXNjPkdvb2QgSGVhbHRoIFByb3N0aGVzZXMgQ29tcGFueTwvZGVzYz4NCgkJCQkJPC9zY29waW5nRW50aXR5Pg0KCQkJCTwvcGFydGljaXBhbnRSb2xlPg0KCQkJPC9wYXJ0aWNpcGFudD4NCgkJPC9zdXBwbHk+DQoJPC9lbnRyeT4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8c3VwcGx5IGNsYXNzQ29kZT0iU1BMWSIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjM0Ii8+IDwhLS0gU3VwcGx5IGFjdGl2aXR5IHRlbXBsYXRlIC0tPg0KCQkJPGlkIHJvb3Q9ImM0ZmZlOThlLTNjZDMtNGM1NC1iNWJkLTA4ZWNiODAzNzllMCIvPg0KCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQk8ZWZmZWN0aXZlVGltZSB4c2k6dHlwZT0iSVZMX1RTIj48Y2VudGVyIHZhbHVlPSIxOTk5Ii8+PC9lZmZlY3RpdmVUaW1lPg0KCQkJPHBhcnRpY2lwYW50IHR5cGVDb2RlPSJERVYiPg0KCQkJCTxwYXJ0aWNpcGFudFJvbGUgY2xhc3NDb2RlPSJNQU5VIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS41MiIvPiA8IS0tIFByb2R1Y3QgaW5zdGFuY2UgdGVtcGxhdGUgLS0+DQoJCQkJCTxwbGF5aW5nRGV2aWNlPg0KCQkJCQkJPGNvZGUgY29kZT0iNTg5MzgwMDgiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJXaGVlbGNoYWlyIi8+DQoJCQkJCTwvcGxheWluZ0RldmljZT4NCgkJCQk8L3BhcnRpY2lwYW50Um9sZT4NCgkJCTwvcGFydGljaXBhbnQ+DQoJCTwvc3VwcGx5Pg0KCTwvZW50cnk+DQo8L3NlY3Rpb24+DQo8L2NvbXBvbmVudD4NCgkJCTwhLS0gDQoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KSW1tdW5pemF0aW9ucyBzZWN0aW9uDQoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KLS0+DQo8Y29tcG9uZW50Pg0KPHNlY3Rpb24+DQoJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS42Ii8+IDwhLS0gSW1tdW5pemF0aW9ucyBzZWN0aW9uIHRlbXBsYXRlIC0tPg0KCTxjb2RlIGNvZGU9IjExMzY5LTYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIvPg0KCTx0aXRsZT5JbW11bml6YXRpb25zPC90aXRsZT4NCgk8dGV4dD4NCgkJPHRhYmxlIGJvcmRlcj0iMSIgd2lkdGg9IjEwMCUiPg0KCQkJPHRoZWFkPg0KCQkJCTx0cj48dGg+VmFjY2luZTwvdGg+PHRoPkRhdGU8L3RoPjx0aD5TdGF0dXM8L3RoPjwvdHI+DQoJCQk8L3RoZWFkPg0KCQkJPHRib2R5Pg0KCQkJCTx0cj48dGQ+SW5mbHVlbnphIHZpcnVzIHZhY2NpbmUsIElNPC90ZD48dGQ+Tm92IDE5OTk8L3RkPjx0ZD5Db21wbGV0ZWQ8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5JbmZsdWVuemEgdmlydXMgdmFjY2luZSwgSU08L3RkPjx0ZD5EZWMgMTk5ODwvdGQ+PHRkPkNvbXBsZXRlZDwvdGQ+PC90cj4NCgkJCQk8dHI+PHRkPlBuZXVtb2NvY2NhbCBwb2x5c2FjY2hhcmlkZSB2YWNjaW5lLCBJTTwvdGQ+PHRkPkRlYyAxOTk4PC90ZD48dGQ+Q29tcGxldGVkPC90ZD48L3RyPg0KCQkJCTx0cj48dGQ+VGV0YW51cyBhbmQgZGlwaHRoZXJpYSB0b3hvaWRzLCBJTTwvdGQ+PHRkPjE5OTc8L3RkPjx0ZD5Db21wbGV0ZWQ8L3RkPjwvdHI+DQoJCQk8L3Rib2R5Pg0KCQk8L3RhYmxlPg0KCTwvdGV4dD4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8c3Vic3RhbmNlQWRtaW5pc3RyYXRpb24gY2xhc3NDb2RlPSJTQkFETSIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI0Ii8+IDwhLS0gTWVkaWNhdGlvbiBhY3Rpdml0eSB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSJlNmYxYmE0My1jMGVkLTRiOWItOWYxMi1mNDM1ZDhhZDhmOTIiLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IklWTF9UUyI+PGNlbnRlciB2YWx1ZT0iMTk5OTExIi8+PC9lZmZlY3RpdmVUaW1lPg0KCQkJPHJvdXRlQ29kZSBjb2RlPSJJTSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS4xMTIiIGNvZGVTeXN0ZW1OYW1lPSJSb3V0ZU9mQWRtaW5pc3RyYXRpb24iIGRpc3BsYXlOYW1lPSJJbnRyYW11c2N1bGFyIGluamVjdGlvbiIvPgkJDQoJCQk8Y29uc3VtYWJsZT4NCgkJCQk8bWFudWZhY3R1cmVkUHJvZHVjdD4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS41MyIvPiA8IS0tIFByb2R1Y3QgdGVtcGxhdGUgLS0+DQoJCQkJCTxtYW51ZmFjdHVyZWRNYXRlcmlhbD4NCgkJCQkJCTxjb2RlIGNvZGU9Ijg4IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjU5IiBkaXNwbGF5TmFtZT0iSW5mbHVlbnphIHZpcnVzIHZhY2NpbmUiPg0KCQkJCQkJCTxvcmlnaW5hbFRleHQ+SW5mbHVlbnphIHZpcnVzIHZhY2NpbmU8L29yaWdpbmFsVGV4dD4NCgkJCQkJCTwvY29kZT4NCgkJCQkJPC9tYW51ZmFjdHVyZWRNYXRlcmlhbD4NCgkJCQk8L21hbnVmYWN0dXJlZFByb2R1Y3Q+DQoJCQk8L2NvbnN1bWFibGU+DQoJCTwvc3Vic3RhbmNlQWRtaW5pc3RyYXRpb24+DQoJPC9lbnRyeT4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8c3Vic3RhbmNlQWRtaW5pc3RyYXRpb24gY2xhc3NDb2RlPSJTQkFETSIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjI0Ii8+IDwhLS0gTWVkaWNhdGlvbiBhY3Rpdml0eSB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSIxMTVmMGY3MC0xMzQzLTQ5MzgtYjYyZi02MzFkZTk3NDlhMGEiLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJPGVmZmVjdGl2ZVRpbWUgeHNpOnR5cGU9IklWTF9UUyI+PGNlbnRlciB2YWx1ZT0iMTk5ODEyIi8+PC9lZmZlY3RpdmVUaW1lPg0KCQkJPHJvdXRlQ29kZSBjb2RlPSJJTSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS4xMTIiIGNvZGVTeXN0ZW1OYW1lPSJSb3V0ZU9mQWRtaW5pc3RyYXRpb24iIGRpc3BsYXlOYW1lPSJJbnRyYW11c2N1bGFyIGluamVjdGlvbiIvPgkJCQ0KCQkJPGNvbnN1bWFibGU+DQoJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3Q+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTMiLz4gPCEtLSBQcm9kdWN0IHRlbXBsYXRlIC0tPg0KCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+DQoJCQkJCQk8Y29kZSBjb2RlPSI4OCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi41OSIgZGlzcGxheU5hbWU9IkluZmx1ZW56YSB2aXJ1cyB2YWNjaW5lIj4NCgkJCQkJCQk8b3JpZ2luYWxUZXh0PkluZmx1ZW56YSB2aXJ1cyB2YWNjaW5lPC9vcmlnaW5hbFRleHQ+DQoJCQkJCQk8L2NvZGU+DQoJCQkJCTwvbWFudWZhY3R1cmVkTWF0ZXJpYWw+DQoJCQkJPC9tYW51ZmFjdHVyZWRQcm9kdWN0Pg0KCQkJPC9jb25zdW1hYmxlPg0KCQk8L3N1YnN0YW5jZUFkbWluaXN0cmF0aW9uPg0KCTwvZW50cnk+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPHN1YnN0YW5jZUFkbWluaXN0cmF0aW9uIGNsYXNzQ29kZT0iU0JBRE0iIG1vb2RDb2RlPSJFVk4iPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yNCIvPiA8IS0tIE1lZGljYXRpb24gYWN0aXZpdHkgdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iNzg1OTg0MDctOWYxNi00MmQ1LThmZmQtMDkyODFhNjBmZTMzIi8+DQoJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCTxlZmZlY3RpdmVUaW1lIHhzaTp0eXBlPSJJVkxfVFMiPjxjZW50ZXIgdmFsdWU9IjE5OTgxMiIvPjwvZWZmZWN0aXZlVGltZT4NCgkJCTxyb3V0ZUNvZGUgY29kZT0iSU0iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuMTEyIiBjb2RlU3lzdGVtTmFtZT0iUm91dGVPZkFkbWluaXN0cmF0aW9uIiBkaXNwbGF5TmFtZT0iSW50cmFtdXNjdWxhciBpbmplY3Rpb24iLz4JCQ0KCQkJPGNvbnN1bWFibGU+DQoJCQkJPG1hbnVmYWN0dXJlZFByb2R1Y3Q+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuNTMiLz4gPCEtLSBQcm9kdWN0IHRlbXBsYXRlIC0tPg0KCQkJCQk8bWFudWZhY3R1cmVkTWF0ZXJpYWw+DQoJCQkJCQk8Y29kZSBjb2RlPSIzMyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi41OSIgZGlzcGxheU5hbWU9IlBuZXVtb2NvY2NhbCBwb2x5c2FjY2hhcmlkZSB2YWNjaW5lIj4NCgkJCQkJCQk8b3JpZ2luYWxUZXh0PlBuZXVtb2NvY2NhbCBwb2x5c2FjY2hhcmlkZSB2YWNjaW5lPC9vcmlnaW5hbFRleHQ+DQoJCQkJCQk8L2NvZGU+DQoJCQkJCTwvbWFudWZhY3R1cmVkTWF0ZXJpYWw+DQoJCQkJPC9tYW51ZmFjdHVyZWRQcm9kdWN0Pg0KCQkJPC9jb25zdW1hYmxlPg0KCQk8L3N1YnN0YW5jZUFkbWluaXN0cmF0aW9uPg0KCTwvZW50cnk+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPHN1YnN0YW5jZUFkbWluaXN0cmF0aW9uIGNsYXNzQ29kZT0iU0JBRE0iIG1vb2RDb2RlPSJFVk4iPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yNCIvPiA8IS0tIE1lZGljYXRpb24gYWN0aXZpdHkgdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iMjYxZTk0YTAtOTVmYi00OTc1LWI1YTUtYzhlMTJjMDFjMWJjIi8+DQoJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCTxlZmZlY3RpdmVUaW1lIHhzaTp0eXBlPSJJVkxfVFMiPjxjZW50ZXIgdmFsdWU9IjE5OTciLz48L2VmZmVjdGl2ZVRpbWU+DQoJCQk8cm91dGVDb2RlIGNvZGU9IklNIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjExMiIgY29kZVN5c3RlbU5hbWU9IlJvdXRlT2ZBZG1pbmlzdHJhdGlvbiIgZGlzcGxheU5hbWU9IkludHJhbXVzY3VsYXIgaW5qZWN0aW9uIi8+CQkNCgkJCTxjb25zdW1hYmxlPg0KCQkJCTxtYW51ZmFjdHVyZWRQcm9kdWN0Pg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjUzIi8+IDwhLS0gUHJvZHVjdCB0ZW1wbGF0ZSAtLT4NCgkJCQkJPG1hbnVmYWN0dXJlZE1hdGVyaWFsPg0KCQkJCQkJPGNvZGUgY29kZT0iMDkiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuNTkiIGRpc3BsYXlOYW1lPSJUZXRhbnVzIGFuZCBkaXBodGhlcmlhIHRveG9pZHMiPg0KCQkJCQkJCTxvcmlnaW5hbFRleHQ+VGV0YW51cyBhbmQgZGlwaHRoZXJpYSB0b3hvaWRzPC9vcmlnaW5hbFRleHQ+DQoJCQkJCQk8L2NvZGU+DQoJCQkJCTwvbWFudWZhY3R1cmVkTWF0ZXJpYWw+DQoJCQkJPC9tYW51ZmFjdHVyZWRQcm9kdWN0Pg0KCQkJPC9jb25zdW1hYmxlPg0KCQk8L3N1YnN0YW5jZUFkbWluaXN0cmF0aW9uPg0KCTwvZW50cnk+DQo8L3NlY3Rpb24+DQo8L2NvbXBvbmVudD4NCgkJCTwhLS0gDQoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KVml0YWwgU2lnbnMgc2VjdGlvbg0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCi0tPg0KPGNvbXBvbmVudD4NCjxzZWN0aW9uPg0KCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMTYiLz4gPCEtLSBWaXRhbCBzaWducyBzZWN0aW9uIHRlbXBsYXRlIC0tPg0KCTxjb2RlIGNvZGU9Ijg3MTYtMyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+DQoJPHRpdGxlPlZpdGFsIFNpZ25zPC90aXRsZT4NCgk8dGV4dD4NCgkJPHRhYmxlIGJvcmRlcj0iMSIgd2lkdGg9IjEwMCUiPg0KCQkJPHRoZWFkPg0KCQkJCTx0cj48dGggYWxpZ249InJpZ2h0Ij5EYXRlIC8gVGltZTogPC90aD48dGg+Tm92IDE0LCAxOTk5PC90aD48dGg+QXByaWwgNywgMjAwMDwvdGg+PC90cj4NCgkJCTwvdGhlYWQ+DQoJCQk8dGJvZHk+DQoJCQkJPHRyPjx0aCBhbGlnbj0ibGVmdCI+SGVpZ2h0PC90aD48dGQ+MTc3IGNtPC90ZD48dGQ+MTc3IGNtPC90ZD48L3RyPg0KCQkJCTx0cj48dGggYWxpZ249ImxlZnQiPldlaWdodDwvdGg+PHRkPjg2IGtnPC90ZD48dGQ+ODgga2c8L3RkPjwvdHI+DQoJCQkJPHRyPjx0aCBhbGlnbj0ibGVmdCI+Qmxvb2QgUHJlc3N1cmU8L3RoPjx0ZD4xMzIvODYgbW1IZzwvdGQ+PHRkPjE0NS84OCBtbUhnPC90ZD48L3RyPg0KCQkJPC90Ym9keT4NCgkJPC90YWJsZT4NCgk8L3RleHQ+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPG9yZ2FuaXplciBjbGFzc0NvZGU9IkNMVVNURVIiIG1vb2RDb2RlPSJFVk4iPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4zNSIvPiA8IS0tIFZpdGFsIHNpZ25zIG9yZ2FuaXplciB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSJjNmY4ODMyMC02N2FkLTExZGItYmQxMy0wODAwMjAwYzlhNjYiLz4NCgkJCTxjb2RlIGNvZGU9IjQ2NjgwMDA1IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iVml0YWwgc2lnbnMiLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjE5OTkxMTE0Ii8+DQoJCQk8Y29tcG9uZW50Pg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzEiLz4gPCEtLSBSZXN1bHQgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCTxpZCByb290PSJjNmY4ODMyMS02N2FkLTExZGItYmQxMy0wODAwMjAwYzlhNjYiLz4NCgkJCQkJPGNvZGUgY29kZT0iNTAzNzMwMDAiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJCb2R5IGhlaWdodCIvPg0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjE5OTkxMTE0Ii8+DQoJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSIxNzciIHVuaXQ9ImNtIi8+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvY29tcG9uZW50Pg0KCQkJPGNvbXBvbmVudD4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMxIi8+IDwhLS0gUmVzdWx0IG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iYzZmODgzMjItNjdhZC0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IjI3MTEzMDAxIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQm9keSB3ZWlnaHQiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIxOTk5MTExNCIvPg0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IlBRIiB2YWx1ZT0iODYiIHVuaXQ9ImtnIi8+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvY29tcG9uZW50Pg0KCQkJPGNvbXBvbmVudD4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMxIi8+IDwhLS0gUmVzdWx0IG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iYzZmODgzMjMtNjdhZC0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IjI3MTY0OTAwNiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IlN5c3RvbGljIEJQIi8+DQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMTk5OTExMTQiLz4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9IjEzMiIgdW5pdD0ibW1bSGddIi8+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvY29tcG9uZW50Pg0KCQkJPGNvbXBvbmVudD4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMxIi8+IDwhLS0gUmVzdWx0IG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iYzZmODgzMjQtNjdhZC0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IjI3MTY1MDAwNiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkRpYXN0b2xpYyBCUCIvPg0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjE5OTkxMTE0Ii8+DQoJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSI4NiIgdW5pdD0ibW1bSGddIi8+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvY29tcG9uZW50Pg0KCQk8L29yZ2FuaXplcj4NCgk8L2VudHJ5Pg0KCTxlbnRyeSB0eXBlQ29kZT0iRFJJViI+DQoJCTxvcmdhbml6ZXIgY2xhc3NDb2RlPSJDTFVTVEVSIiBtb29kQ29kZT0iRVZOIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzUiLz4gPCEtLSBWaXRhbCBzaWducyBvcmdhbml6ZXIgdGVtcGxhdGUgLS0+DQoJCQk8aWQgcm9vdD0iZDExMjc1ZTAtNjdhZS0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+DQoJCQk8Y29kZSBjb2RlPSI0NjY4MDAwNSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IlZpdGFsIHNpZ25zIi8+DQoJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDAwMDQwNyIvPg0KCQkJPGNvbXBvbmVudD4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMxIi8+IDwhLS0gUmVzdWx0IG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iZDExMjc1ZTEtNjdhZS0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IjUwMzczMDAwIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQm9keSBoZWlnaHQiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDAwMDQwNyIvPg0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IlBRIiB2YWx1ZT0iMTc3IiB1bml0PSJjbSIvPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2NvbXBvbmVudD4NCgkJCTxjb21wb25lbnQ+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4zMSIvPiA8IS0tIFJlc3VsdCBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9ImQxMTI3NWUyLTY3YWUtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQk8Y29kZSBjb2RlPSIyNzExMzAwMSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi45NiIgZGlzcGxheU5hbWU9IkJvZHkgd2VpZ2h0Ii8+DQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDA0MDciLz4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9Ijg4IiB1bml0PSJrZyIvPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2NvbXBvbmVudD4NCgkJCTxjb21wb25lbnQ+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4zMSIvPiA8IS0tIFJlc3VsdCBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9ImQxMTI3NWUzLTY3YWUtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQk8Y29kZSBjb2RlPSIyNzE2NDkwMDYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJTeXN0b2xpYyBCUCIvPg0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMDAwNDA3Ii8+DQoJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSIxNDUiIHVuaXQ9Im1tW0hnXSIvPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2NvbXBvbmVudD4NCgkJCTxjb21wb25lbnQ+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4zMSIvPiA8IS0tIFJlc3VsdCBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9ImQxMTI3NWU0LTY3YWUtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQk8Y29kZSBjb2RlPSIyNzE2NTAwMDYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJEaWFzdG9saWMgQlAiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDAwMDQwNyIvPg0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IlBRIiB2YWx1ZT0iODgiIHVuaXQ9Im1tW0hnXSIvPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2NvbXBvbmVudD4NCgkJPC9vcmdhbml6ZXI+DQoJPC9lbnRyeT4NCjwvc2VjdGlvbj4NCjwvY29tcG9uZW50Pg0KCQkJPCEtLSANCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqDQpSZXN1bHRzIHNlY3Rpb24NCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqDQotLT4NCjxjb21wb25lbnQ+DQo8c2VjdGlvbj4NCgk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjE0Ii8+IDwhLS0gUmVzdWx0cyBzZWN0aW9uIHRlbXBsYXRlIC0tPg0KCTxjb2RlIGNvZGU9IjMwOTU0LTIiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIvPg0KCTx0aXRsZT5SZXN1bHRzPC90aXRsZT4NCgk8dGV4dD4NCgkJPHRhYmxlIGJvcmRlcj0iMSIgd2lkdGg9IjEwMCUiPg0KCQkJPHRoZWFkPg0KCQkJCTx0cj48dGg+JiMxNjA7PC90aD48dGg+TWFyY2ggMjMsIDIwMDA8L3RoPjx0aD5BcHJpbCAwNiwgMjAwMDwvdGg+PC90cj4NCgkJCTwvdGhlYWQ+DQoJCQk8dGJvZHk+DQoJCQkJPHRyPjx0ZCBjb2xzcGFuPSIzIj48Y29udGVudCBzdHlsZUNvZGU9IkJvbGRJdGFsaWNzIj5IZW1hdG9sb2d5PC9jb250ZW50PjwvdGQ+PC90cj4NCgkJCQk8dHI+PHRkPkhHQiAoTSAxMy0xOCBnL2RsOyBGIDEyLTE2IGcvZGwpPC90ZD48dGQ+MTMuMjwvdGQ+PHRkPiYjMTYwOzwvdGQ+PC90cj4NCgkJCQk8dHI+PHRkPldCQyAoNC4zLTEwLjggMTArMy91bCk8L3RkPjx0ZD42Ljc8L3RkPjx0ZD4mIzE2MDs8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5QTFQgKDEzNS0xNDUgbWVxL2wpPC90ZD48dGQ+MTIzKjwvdGQ+PHRkPiYjMTYwOzwvdGQ+PC90cj4NCgkJCQk8dHI+PHRkIGNvbHNwYW49IjMiPjxjb250ZW50IHN0eWxlQ29kZT0iQm9sZEl0YWxpY3MiPkNoZW1pc3RyeTwvY29udGVudD48L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5OQSAoMTM1LTE0NW1lcS9sKTwvdGQ+PHRkPiYjMTYwOzwvdGQ+PHRkPjE0MDwvdGQ+PC90cj4NCgkJCQk8dHI+PHRkPksgKDMuNS01LjAgbWVxL2wpPC90ZD48dGQ+JiMxNjA7PC90ZD48dGQ+NC4wPC90ZD48L3RyPg0KCQkJCTx0cj48dGQ+Q0wgKDk4LTEwNiBtZXEvbCk8L3RkPjx0ZD4mIzE2MDs8L3RkPjx0ZD4xMDI8L3RkPjwvdHI+DQoJCQkJPHRyPjx0ZD5IQ08zICgxOC0yMyBtZXEvbCk8L3RkPjx0ZD4mIzE2MDs8L3RkPjx0ZD4zNSo8L3RkPjwvdHI+DQoJCQk8L3Rib2R5Pg0KCQk8L3RhYmxlPg0KCTwvdGV4dD4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8b3JnYW5pemVyIGNsYXNzQ29kZT0iQkFUVEVSWSIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMyIi8+IDwhLS0gUmVzdWx0IG9yZ2FuaXplciB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSI3ZDVhMDJiMC02N2E0LTExZGItYmQxMy0wODAwMjAwYzlhNjYiLz4NCgkJCTxjb2RlIGNvZGU9IjQzNzg5MDA5IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iQ0JDIFdPIERJRkZFUkVOVElBTCIvPg0KCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDAzMjMxNDMwIi8+DQoJCQk8Y29tcG9uZW50Pg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzEiLz4gPCEtLSBSZXN1bHQgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCTxpZCByb290PSIxMDdjMmRjMC02N2E1LTExZGItYmQxMy0wODAwMjAwYzlhNjYiLz4NCgkJCQkJPGNvZGUgY29kZT0iMzAzMTMtMSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBkaXNwbGF5TmFtZT0iSEdCIi8+DQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDAzMjMxNDMwIi8+DQoJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSIxMy4yIiB1bml0PSJnL2RsIi8+DQoJCQkJCTxpbnRlcnByZXRhdGlvbkNvZGUgY29kZT0iTiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNS44MyIvPg0KCQkJCQk8cmVmZXJlbmNlUmFuZ2U+DQoJCQkJCQk8b2JzZXJ2YXRpb25SYW5nZT4NCgkJCQkJCQk8dGV4dD5NIDEzLTE4IGcvZGw7IEYgMTItMTYgZy9kbDwvdGV4dD4NCgkJCQkJCTwvb2JzZXJ2YXRpb25SYW5nZT4NCgkJCQkJPC9yZWZlcmVuY2VSYW5nZT4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9jb21wb25lbnQ+DQoJCQk8Y29tcG9uZW50Pg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzEiLz4gPCEtLSBSZXN1bHQgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCTxpZCByb290PSI4YjNmYTM3MC02N2E1LTExZGItYmQxMy0wODAwMjAwYzlhNjYiLz4NCgkJCQkJPGNvZGUgY29kZT0iMzM3NjUtOSIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBkaXNwbGF5TmFtZT0iV0JDIi8+DQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDAzMjMxNDMwIi8+DQoJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSI2LjciIHVuaXQ9IjEwKzMvdWwiLz4NCgkJCQkJPGludGVycHJldGF0aW9uQ29kZSBjb2RlPSJOIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjgzIi8+DQoJCQkJCTxyZWZlcmVuY2VSYW5nZT4NCgkJCQkJCTxvYnNlcnZhdGlvblJhbmdlPg0KCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iSVZMX1BRIj4NCgkJCQkJCQkJPGxvdyB2YWx1ZT0iNC4zIiB1bml0PSIxMCszL3VsIi8+DQoJCQkJCQkJCTxoaWdoIHZhbHVlPSIxMC44IiB1bml0PSIxMCszL3VsIi8+DQoJCQkJCQkJPC92YWx1ZT4NCgkJCQkJCTwvb2JzZXJ2YXRpb25SYW5nZT4NCgkJCQkJPC9yZWZlcmVuY2VSYW5nZT4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9jb21wb25lbnQ+DQoJCQk8Y29tcG9uZW50Pg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzEiLz4gPCEtLSBSZXN1bHQgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCTxpZCByb290PSI4MGE2Yzc0MC02N2E1LTExZGItYmQxMy0wODAwMjAwYzlhNjYiLz4NCgkJCQkJPGNvZGUgY29kZT0iMjY1MTUtNyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBkaXNwbGF5TmFtZT0iUExUIi8+DQoJCQkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJCQk8ZWZmZWN0aXZlVGltZSB2YWx1ZT0iMjAwMDAzMjMxNDMwIi8+DQoJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iUFEiIHZhbHVlPSIxMjMiIHVuaXQ9IjEwKzMvdWwiLz4NCgkJCQkJPGludGVycHJldGF0aW9uQ29kZSBjb2RlPSJMIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjgzIi8+DQoJCQkJCTxyZWZlcmVuY2VSYW5nZT4NCgkJCQkJCTxvYnNlcnZhdGlvblJhbmdlPg0KCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iSVZMX1BRIj4NCgkJCQkJCQkJPGxvdyB2YWx1ZT0iMTUwIiB1bml0PSIxMCszL3VsIi8+DQoJCQkJCQkJCTxoaWdoIHZhbHVlPSIzNTAiIHVuaXQ9IjEwKzMvdWwiLz4NCgkJCQkJCQk8L3ZhbHVlPg0KCQkJCQkJPC9vYnNlcnZhdGlvblJhbmdlPg0KCQkJCQk8L3JlZmVyZW5jZVJhbmdlPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2NvbXBvbmVudD4NCgkJPC9vcmdhbml6ZXI+DQoJPC9lbnRyeT4NCgk8ZW50cnkgdHlwZUNvZGU9IkRSSVYiPg0KCQk8b3JnYW5pemVyIGNsYXNzQ29kZT0iQkFUVEVSWSIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMyIi8+IDwhLS0gUmVzdWx0IG9yZ2FuaXplciB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSJhNDAwMjdlMC02N2E1LTExZGItYmQxMy0wODAwMjAwYzlhNjYiLz4NCgkJCTxjb2RlIGNvZGU9IjIwMTA5MDA1IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iTFlURVMiLz4NCgkJCTxzdGF0dXNDb2RlIGNvZGU9ImNvbXBsZXRlZCIvPg0KCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMDAwNDA2MTMwMCIvPg0KCQkJPGNvbXBvbmVudD4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMxIi8+IDwhLS0gUmVzdWx0IG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iYTQwMDI3ZTEtNjdhNS0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IjI5NTEtMiIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBkaXNwbGF5TmFtZT0iTkEiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDAwMDQwNjEzMDAiLz4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9IjE0MCIgdW5pdD0ibWVxL2wiLz4NCgkJCQkJPGludGVycHJldGF0aW9uQ29kZSBjb2RlPSJOIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My41LjgzIi8+DQoJCQkJCTxyZWZlcmVuY2VSYW5nZT4NCgkJCQkJCTxvYnNlcnZhdGlvblJhbmdlPg0KCQkJCQkJCTx2YWx1ZSB4c2k6dHlwZT0iSVZMX1BRIj4NCgkJCQkJCQkJPGxvdyB2YWx1ZT0iMTM1IiB1bml0PSJtZXEvbCIvPg0KCQkJCQkJCQk8aGlnaCB2YWx1ZT0iMTQ1IiB1bml0PSJtZXEvbCIvPg0KCQkJCQkJCTwvdmFsdWU+DQoJCQkJCQk8L29ic2VydmF0aW9uUmFuZ2U+DQoJCQkJCTwvcmVmZXJlbmNlUmFuZ2U+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvY29tcG9uZW50Pg0KCQkJPGNvbXBvbmVudD4NCgkJCQk8b2JzZXJ2YXRpb24gY2xhc3NDb2RlPSJPQlMiIG1vb2RDb2RlPSJFVk4iPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjMxIi8+IDwhLS0gUmVzdWx0IG9ic2VydmF0aW9uIHRlbXBsYXRlIC0tPg0KCQkJCQk8aWQgcm9vdD0iYTQwMDI3ZTItNjdhNS0xMWRiLWJkMTMtMDgwMDIwMGM5YTY2Ii8+DQoJCQkJCTxjb2RlIGNvZGU9IjI4MjMtMyIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIiBkaXNwbGF5TmFtZT0iSyIvPg0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMDAwNDA2MTMwMCIvPg0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IlBRIiB2YWx1ZT0iNC4wIiB1bml0PSJtZXEvbCIvPg0KCQkJCQk8aW50ZXJwcmV0YXRpb25Db2RlIGNvZGU9Ik4iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODMiLz4NCgkJCQkJPHJlZmVyZW5jZVJhbmdlPg0KCQkJCQkJPG9ic2VydmF0aW9uUmFuZ2U+DQoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJJVkxfUFEiPg0KCQkJCQkJCQk8bG93IHZhbHVlPSIzLjUiIHVuaXQ9Im1lcS9sIi8+DQoJCQkJCQkJCTxoaWdoIHZhbHVlPSI1LjAiIHVuaXQ9Im1lcS9sIi8+DQoJCQkJCQkJPC92YWx1ZT4NCgkJCQkJCTwvb2JzZXJ2YXRpb25SYW5nZT4NCgkJCQkJPC9yZWZlcmVuY2VSYW5nZT4NCgkJCQk8L29ic2VydmF0aW9uPg0KCQkJPC9jb21wb25lbnQ+DQoJCQk8Y29tcG9uZW50Pg0KCQkJCTxvYnNlcnZhdGlvbiBjbGFzc0NvZGU9Ik9CUyIgbW9vZENvZGU9IkVWTiI+DQoJCQkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMzEiLz4gPCEtLSBSZXN1bHQgb2JzZXJ2YXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJCTxpZCByb290PSJhNDAwMjdlMy02N2E1LTExZGItYmQxMy0wODAwMjAwYzlhNjYiLz4NCgkJCQkJPGNvZGUgY29kZT0iMjA3NS0wIiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiIGRpc3BsYXlOYW1lPSJDTCIvPg0KCQkJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMDAwNDA2MTMwMCIvPg0KCQkJCQk8dmFsdWUgeHNpOnR5cGU9IlBRIiB2YWx1ZT0iMTAyIiB1bml0PSJtZXEvbCIvPg0KCQkJCQk8aW50ZXJwcmV0YXRpb25Db2RlIGNvZGU9Ik4iIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODMiLz4NCgkJCQkJPHJlZmVyZW5jZVJhbmdlPg0KCQkJCQkJPG9ic2VydmF0aW9uUmFuZ2U+DQoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJJVkxfUFEiPg0KCQkJCQkJCQk8bG93IHZhbHVlPSI5OCIgdW5pdD0ibWVxL2wiLz4NCgkJCQkJCQkJPGhpZ2ggdmFsdWU9IjEwNiIgdW5pdD0ibWVxL2wiLz4NCgkJCQkJCQk8L3ZhbHVlPg0KCQkJCQkJPC9vYnNlcnZhdGlvblJhbmdlPg0KCQkJCQk8L3JlZmVyZW5jZVJhbmdlPg0KCQkJCTwvb2JzZXJ2YXRpb24+DQoJCQk8L2NvbXBvbmVudD4NCgkJCTxjb21wb25lbnQ+DQoJCQkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iRVZOIj4NCgkJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4zMSIvPiA8IS0tIFJlc3VsdCBvYnNlcnZhdGlvbiB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9ImE0MDAyN2U0LTY3YTUtMTFkYi1iZDEzLTA4MDAyMDBjOWE2NiIvPg0KCQkJCQk8Y29kZSBjb2RlPSIxOTYzLTgiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIgZGlzcGxheU5hbWU9IkhDTzMiLz4NCgkJCQkJPHN0YXR1c0NvZGUgY29kZT0iY29tcGxldGVkIi8+DQoJCQkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIyMDAwMDQwNjEzMDAiLz4NCgkJCQkJPHZhbHVlIHhzaTp0eXBlPSJQUSIgdmFsdWU9IjM1IiB1bml0PSJtZXEvbCIvPg0KCQkJCQk8aW50ZXJwcmV0YXRpb25Db2RlIGNvZGU9IkgiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuODMiLz4NCgkJCQkJPHJlZmVyZW5jZVJhbmdlPg0KCQkJCQkJPG9ic2VydmF0aW9uUmFuZ2U+DQoJCQkJCQkJPHZhbHVlIHhzaTp0eXBlPSJJVkxfUFEiPg0KCQkJCQkJCQk8bG93IHZhbHVlPSIxOCIgdW5pdD0ibWVxL2wiLz4NCgkJCQkJCQkJPGhpZ2ggdmFsdWU9IjIzIiB1bml0PSJtZXEvbCIvPg0KCQkJCQkJCTwvdmFsdWU+DQoJCQkJCQk8L29ic2VydmF0aW9uUmFuZ2U+DQoJCQkJCTwvcmVmZXJlbmNlUmFuZ2U+DQoJCQkJPC9vYnNlcnZhdGlvbj4NCgkJCTwvY29tcG9uZW50Pg0KCQk8L29yZ2FuaXplcj4NCgk8L2VudHJ5Pg0KPC9zZWN0aW9uPgkJCQ0KPC9jb21wb25lbnQ+DQoJCQk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNClByb2NlZHVyZXMgc2VjdGlvbg0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCi0tPg0KPGNvbXBvbmVudD4NCjxzZWN0aW9uPg0KCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMTIiLz4gPCEtLSBQcm9jZWR1cmVzIHNlY3Rpb24gdGVtcGxhdGUgLS0+DQoJPGNvZGUgY29kZT0iNDc1MTktNCIgY29kZVN5c3RlbT0iMi4xNi44NDAuMS4xMTM4ODMuNi4xIi8+DQoJPHRpdGxlPlByb2NlZHVyZXM8L3RpdGxlPg0KCTx0ZXh0Pg0KCQkJPHRhYmxlIGJvcmRlcj0iMSIgd2lkdGg9IjEwMCUiPg0KCQkJPHRoZWFkPg0KCQkJCTx0cj48dGg+UHJvY2VkdXJlPC90aD48dGg+RGF0ZTwvdGg+PC90cj4NCgkJCTwvdGhlYWQ+DQoJCQk8dGJvZHk+DQoJCQkJPHRyPjx0ZD48Y29udGVudCBJRD0iUHJvYzEiPlRvdGFsIGhpcCByZXBsYWNlbWVudCwgbGVmdDwvY29udGVudD48L3RkPjx0ZD4xOTk4PC90ZD48L3RyPg0KCQkJPC90Ym9keT4NCgkJPC90YWJsZT4NCgk8L3RleHQ+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPHByb2NlZHVyZSBjbGFzc0NvZGU9IlBST0MiIG1vb2RDb2RlPSJFVk4iPg0KCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4yOSIvPiA8IS0tIFByb2NlZHVyZSBhY3Rpdml0eSB0ZW1wbGF0ZSAtLT4NCgkJCTxpZCByb290PSJlNDAxZjM0MC03YmUyLTExZGItOWZlMS0wODAwMjAwYzlhNjYiLz4NCgkJCTxjb2RlIGNvZGU9IjUyNzM0MDA3IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42Ljk2IiBkaXNwbGF5TmFtZT0iVG90YWwgaGlwIHJlcGxhY2VtZW50Ij4NCgkJCQk8b3JpZ2luYWxUZXh0PjxyZWZlcmVuY2UgdmFsdWU9IiNQcm9jMSIvPjwvb3JpZ2luYWxUZXh0Pg0KCQkJCTxxdWFsaWZpZXI+DQoJCQkJCTxuYW1lIGNvZGU9IjI3Mjc0MTAwMyIgZGlzcGxheU5hbWU9IkxhdGVyYWxpdHkiLz4NCgkJCQkJPHZhbHVlIGNvZGU9Ijc3NzEwMDAiIGRpc3BsYXlOYW1lPSJMZWZ0Ii8+DQoJCQkJPC9xdWFsaWZpZXI+DQoJCQk8L2NvZGU+DQoJCQk8c3RhdHVzQ29kZSBjb2RlPSJjb21wbGV0ZWQiLz4NCgkJCTxlZmZlY3RpdmVUaW1lIHZhbHVlPSIxOTk4Ii8+DQoJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IkRFViI+DQoJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9Ik1BTlUiPg0KCQkJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjUyIi8+IDwhLS0gUHJvZHVjdCBpbnN0YW5jZSB0ZW1wbGF0ZSAtLT4NCgkJCQkJPGlkIHJvb3Q9IjAzY2EwMWIwLTdiZTEtMTFkYi05ZmUxLTA4MDAyMDBjOWE2NiIvPg0KCQkJCTwvcGFydGljaXBhbnRSb2xlPg0KCQkJPC9wYXJ0aWNpcGFudD4NCgkJPC9wcm9jZWR1cmU+DQoJPC9lbnRyeT4NCjwvc2VjdGlvbj4NCjwvY29tcG9uZW50Pg0KDQoJCQk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCkVuY291bnRlcnMgc2VjdGlvbg0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCi0tPg0KPGNvbXBvbmVudD4NCjxzZWN0aW9uPg0KCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMyIvPiA8IS0tIEVuY291bnRlcnMgc2VjdGlvbiB0ZW1wbGF0ZSAtLT4NCgk8Y29kZSBjb2RlPSI0NjI0MC04IiBjb2RlU3lzdGVtPSIyLjE2Ljg0MC4xLjExMzg4My42LjEiLz4NCgk8dGl0bGU+RW5jb3VudGVyczwvdGl0bGU+DQoJPHRleHQ+DQoJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4NCgkJCTx0aGVhZD4NCgkJCQk8dHI+PHRoPkVuY291bnRlcjwvdGg+PHRoPkxvY2F0aW9uPC90aD48dGg+RGF0ZTwvdGg+PC90cj4NCgkJCTwvdGhlYWQ+DQoJCQk8dGJvZHk+DQoJCQkJPHRyPjx0ZD5DaGVja3VwIEV4YW1pbmF0aW9uPC90ZD48dGQ+R29vZCBIZWFsdGggQ2xpbmljPC90ZD48dGQ+QXByIDA3LCAyMDAwPC90ZD48L3RyPg0KCQkJPC90Ym9keT4NCgkJPC90YWJsZT4NCgk8L3RleHQ+DQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPGVuY291bnRlciBjbGFzc0NvZGU9IkVOQyIgbW9vZENvZGU9IkVWTiI+DQoJCQk8dGVtcGxhdGVJZCByb290PSIyLjE2Ljg0MC4xLjExMzg4My4xMC4yMC4xLjIxIi8+IDwhLS0gRW5jb3VudGVyIGFjdGl2aXR5IHRlbXBsYXRlIC0tPg0KCQkJPGlkIHJvb3Q9IjJhNjIwMTU1LTlkMTEtNDM5ZS05MmIzLTVkOTgxNWZmNGRlOCIvPg0KCQkJPGNvZGUgY29kZT0iR0VOUkwiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjUuNCIgZGlzcGxheU5hbWU9IkdlbmVyYWwiPg0KCQkJCTxvcmlnaW5hbFRleHQ+Q2hlY2t1cCBFeGFtaW5hdGlvbjwvb3JpZ2luYWxUZXh0Pg0KCQkJPC9jb2RlPg0KCQkJPGVmZmVjdGl2ZVRpbWUgdmFsdWU9IjIwMDAwNDA3Ii8+DQoJCQk8cGFydGljaXBhbnQgdHlwZUNvZGU9IkxPQyI+DQoJCQkJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS40NSIvPiA8IS0tIExvY2F0aW9uIHBhcnRpY2lwYXRpb24gdGVtcGxhdGUgLS0+DQoJCQkJPHBhcnRpY2lwYW50Um9sZSBjbGFzc0NvZGU9IlNETE9DIj4NCgkJCQkJPGlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjE5LjUiLz4NCgkJCQkJPHBsYXlpbmdFbnRpdHkgY2xhc3NDb2RlPSJQTEMiPg0KCQkJCQkJPG5hbWU+R29vZCBIZWFsdGggQ2xpbmljPC9uYW1lPg0KCQkJCQk8L3BsYXlpbmdFbnRpdHk+DQoJCQkJPC9wYXJ0aWNpcGFudFJvbGU+DQoJCQk8L3BhcnRpY2lwYW50Pg0KCQk8L2VuY291bnRlcj4NCgk8L2VudHJ5Pg0KPC9zZWN0aW9uPg0KPC9jb21wb25lbnQ+DQoJCQk8IS0tIA0KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNClBsYW4gb2YgQ2FyZSBzZWN0aW9uDQoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KLS0+DQo8Y29tcG9uZW50Pg0KPHNlY3Rpb24+DQoJPHRlbXBsYXRlSWQgcm9vdD0iMi4xNi44NDAuMS4xMTM4ODMuMTAuMjAuMS4xMCIvPiA8IS0tIFBsYW4gb2YgQ2FyZSBzZWN0aW9uIHRlbXBsYXRlIC0tPg0KCTxjb2RlIGNvZGU9IjE4Nzc2LTUiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuMSIvPg0KCTx0aXRsZT5QbGFuPC90aXRsZT4NCgkJPHRleHQ+DQoJCTx0YWJsZSBib3JkZXI9IjEiIHdpZHRoPSIxMDAlIj4NCgkJCTx0aGVhZD4NCgkJCTx0cj48dGg+UGxhbm5lZCBBY3Rpdml0eTwvdGg+PHRoPlBsYW5uZWQgRGF0ZTwvdGg+PC90cj4NCgkJCTwvdGhlYWQ+DQoJCQk8dGJvZHk+DQoJCQk8dHI+PHRkPlB1bG1vbmFyeSBmdW5jdGlvbiB0ZXN0PC90ZD48dGQ+QXByaWwgMjEsIDIwMDA8L3RkPjwvdHI+DQoJCQk8L3Rib2R5Pg0KCQk8L3RhYmxlPg0KCTwvdGV4dD4JDQoJPGVudHJ5IHR5cGVDb2RlPSJEUklWIj4NCgkJPG9ic2VydmF0aW9uIGNsYXNzQ29kZT0iT0JTIiBtb29kQ29kZT0iUlFPIj4NCgkJCTx0ZW1wbGF0ZUlkIHJvb3Q9IjIuMTYuODQwLjEuMTEzODgzLjEwLjIwLjEuMjUiLz4gPCEtLSBQbGFuIG9mIEFjdGl2aXR5IGFjdGl2aXR5IHRlbXBsYXRlIC0tPg0KCQkJPGlkIHJvb3Q9IjlhNmQxYmFjLTE3ZDMtNDE5NS04OWE0LTExMjFiYzgwOWI0YSIvPg0KCQkJPGNvZGUgY29kZT0iMjM0MjYwMDYiIGNvZGVTeXN0ZW09IjIuMTYuODQwLjEuMTEzODgzLjYuOTYiIGRpc3BsYXlOYW1lPSJQdWxtb25hcnkgZnVuY3Rpb24gdGVzdCIvPg0KCQkJPHN0YXR1c0NvZGUgY29kZT0ibmV3Ii8+DQoJCQk8ZWZmZWN0aXZlVGltZT48Y2VudGVyIHZhbHVlPSIyMDAwMDQyMSIvPjwvZWZmZWN0aXZlVGltZT4NCgkJPC9vYnNlcnZhdGlvbj4NCgk8L2VudHJ5Pg0KPC9zZWN0aW9uPg0KPC9jb21wb25lbnQ+DQo8L3N0cnVjdHVyZWRCb2R5Pg0KPC9jb21wb25lbnQ+DQo8L0NsaW5pY2FsRG9jdW1lbnQ+DQo=","base64").toString();
        var result = bb.parseString(data);
        result.meta.sections.sort();

        // check validation
        var val = bb.validator.validateDocumentModel(result);

        // generate ccda
        var xml = bbg.generateCCD(result);

        // parse generated ccda
        var result2 = bb.parseString(xml);
        result2.meta.sections.sort();

        // re-generate
        var xml2 = bbg.generateCCD(result2);

        delete result.errors;
        delete result2.errors;
        delete result.data.providers;
        result.meta.sections = result.meta.sections.filter(function (v) {
            return v !== 'providers';
        });

        assert.deepEqual(result2, result);
    });

    it('cms_sample.xml should not crash', function () {
        var data = Buffer("LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KTVlNRURJQ0FSRS5HT1YgUEVSU09OQUwgSEVBTFRIIElORk9STUFUSU9OCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoqKioqKioqKioqQ09ORklERU5USUFMKioqKioqKioqKioKClByb2R1Y2VkIGJ5IHRoZSBCbHVlIEJ1dHRvbiAodjIuMCkKCjAzLzE2LzIwMTMgNToxMCBBTQoKCgoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KRGVtb2dyYXBoaWMKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpTb3VyY2U6IE15TWVkaWNhcmUuZ292CgoKCk5hbWU6IEpPSE4gRE9FCgpEYXRlIG9mIEJpcnRoOiAwMS8wMS8xOTEwCgpBZGRyZXNzIExpbmUgMTogMTIzIEFOWSBST0FECgpBZGRyZXNzIExpbmUgMjogCgpDaXR5OiBBTllUT1dOCgpTdGF0ZTogVkEKClppcDogMDAwMDEKClBob25lIE51bWJlcjogMTIzLTQ1Ni03ODkwCgpFbWFpbDogSk9ITkRPRUBleGFtcGxlLmNvbQoKUGFydCBBIEVmZmVjdGl2ZSBEYXRlOiAwMS8wMS8yMDEyCgpQYXJ0IEIgRWZmZWN0aXZlIERhdGU6IDAxLzAxLzIwMTIKCgoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KRW1lcmdlbmN5IENvbnRhY3QKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpTb3VyY2U6IFNlbGYtRW50ZXJlZAoKCgpDb250YWN0IE5hbWU6IEpBTkUgRE9FCgpBZGRyZXNzIFR5cGU6SG9tZQoKQWRkcmVzcyBMaW5lIDE6IDEyMyBBbnlXaGVyZSBTdAoKQWRkcmVzcyBMaW5lIDI6IAoKQ2l0eTogQW55V2hlcmUKClN0YXRlOiBEQwoKWmlwOiAwMDAwMi0xMTExCgpSZWxhdGlvbnNoaXA6IE90aGVyCgpIb21lIFBob25lOiAxMjMtNDU2LTc4OTAKCldvcmsgUGhvbmU6IDAwMC0wMDEtMDAwMQoKTW9iaWxlIFBob25lOiAwMDAtMDAxLTAwMDIKCkVtYWlsIEFkZHJlc3M6IEpBTkVET0VAZXhhbXBsZS5jb20KCgoKQ29udGFjdCBOYW1lOiBTVEVWRSBET0UKCkFkZHJlc3MgVHlwZToKCkFkZHJlc3MgTGluZSAxOiAxMjMgQW55V2hlcmUgUmQKCkFkZHJlc3MgTGluZSAyOiAKCkNpdHk6IEFueVdoZXJlCgpTdGF0ZTogVkEKClppcDogMDAwMDEKClJlbGF0aW9uc2hpcDogT3RoZXIKCkhvbWUgUGhvbmU6IDEyMy00NTYtNzg5MAoKV29yayBQaG9uZTogMDAwLTAwMS0wMDAxCgpNb2JpbGUgUGhvbmU6IDAwMC0wMDEtMDAwMgoKRW1haWwgQWRkcmVzczogU1RFVkVET0VAZXhhbXBsZS5jb20KCgoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KU2VsZiBSZXBvcnRlZCBNZWRpY2FsIENvbmRpdGlvbnMKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpTb3VyY2U6IFNlbGYtRW50ZXJlZAoKCgpDb25kaXRpb24gTmFtZTogQXJ0aHJpdGlzCgpNZWRpY2FsIENvbmRpdGlvbiBTdGFydCBEYXRlOiAwOC8wOS8yMDA1CgpNZWRpY2FsIENvbmRpdGlvbiBFbmQgRGF0ZTogMDIvMjgvMjAxMQoKCgpDb25kaXRpb24gTmFtZTogQXN0aG1hCgpNZWRpY2FsIENvbmRpdGlvbiBTdGFydCBEYXRlOiAwMS8yNS8yMDA4CgpNZWRpY2FsIENvbmRpdGlvbiBFbmQgRGF0ZTogMDEvMjUvMjAxMAoKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpTZWxmIFJlcG9ydGVkIEFsbGVyZ2llcwoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KClNvdXJjZTogU2VsZi1FbnRlcmVkCgoKCkFsbGVyZ3kgTmFtZTogQW50aWJvdGljCgpUeXBlOiBEcnVncwoKUmVhY3Rpb246IFZvbWl0aW5nCgpTZXZlcml0eTogU2V2ZXJlCgpEaWFnbm9zZWQ6IFllcwoKVHJlYXRtZW50OiBBbGxlcmd5IFNob3RzCgpGaXJzdCBFcGlzb2RlIERhdGU6IDAxLzA4LzE5MjYKCkxhc3QgRXBpc29kZSBEYXRlOiAwMy8xMy8xOTU1CgpMYXN0IFRyZWF0bWVudCBEYXRlOiAwOS8yOC8xOTQ5CgpDb21tZW50czogRXJ5dGhyb215Y2luIAoKCgpBbGxlcmd5IE5hbWU6IEdyYXNzZXMKClR5cGU6IEVudmlyb25tZW50YWwKClJlYWN0aW9uOiBTbmVlemluZwoKU2V2ZXJpdHk6IFNldmVyZQoKRGlhZ25vc2VkOiBZZXMKClRyZWF0bWVudDogQXZvaWRhbmNlCgpGaXJzdCBFcGlzb2RlIERhdGU6IDA1LzEzLzE5NzMKCkxhc3QgRXBpc29kZSBEYXRlOiAwNy8yMC8xOTk2CgpMYXN0IFRyZWF0bWVudCBEYXRlOiAwOS8yNy8yMDA4CgpDb21tZW50czogCgoKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tClNlbGYgUmVwb3J0ZWQgSW1wbGFudGFibGUgRGV2aWNlCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKU291cmNlOiBTZWxmLUVudGVyZWQKCgoKRGV2aWNlIE5hbWU6IEFydGlmaWNpYWwgRXllIExlbnNlcwoKRGF0ZSBJbXBsYW50ZWQ6IDEvMjcvMTk0MgoKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpTZWxmIFJlcG9ydGVkIEltbXVuaXphdGlvbnMKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpTb3VyY2U6IFNlbGYtRW50ZXJlZAoKCgpJbW11bml6YXRpb24gTmFtZTogVmFyaWNlbGxhL0NoaWNrZW4gUG94CgpEYXRlIEFkbWluaXN0ZXJlZDowNC8yMS8yMDAyCgpNZXRob2Q6IE5hc2FsIFNwcmF5KG1pc3QpCgpXZXJlIHlvdSB2YWNjaW5hdGVkIGluIHRoZSBVUzogCgpDb21tZW50czogY29uZ2VzdGlvbgoKQm9vc3RlciAxIERhdGU6IDAyLzAyLzE5OTAKCkJvb3N0ZXIgMiBEYXRlOiAKCkJvb3N0ZXIgMyBEYXRlOiAKCgoKSW1tdW5pemF0aW9uIE5hbWU6IHR5cGhvaWQKCkRhdGUgQWRtaW5pc3RlcmVkOjAxLzAyLzIwMDkKCk1ldGhvZDogSW5qZWN0aW9uCgpXZXJlIHlvdSB2YWNjaW5hdGVkIGluIHRoZSBVUzogCgpDb21tZW50czogCgpCb29zdGVyIDEgRGF0ZTogCgpCb29zdGVyIDIgRGF0ZTogCgpCb29zdGVyIDMgRGF0ZTogCgoKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tClNlbGYgUmVwb3J0ZWQgTGFicyBhbmQgVGVzdHMKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpTb3VyY2U6IFNlbGYtRW50ZXJlZAoKCgpUZXN0L0xhYiBUeXBlOiBHbHVjb3NlIExldmVsCkRhdGUgVGFrZW46IDAzLzIxLzIwMDgKCkFkbWluaXN0ZXJlZCBieTogQW55TGFiCgpSZXF1ZXN0aW5nIERvY3RvcjogRHIuIFNtaXRoCgpSZWFzb24gVGVzdC9MYWIgUmVxdWVzdGVkOiBPbmdvaW5nIGVsZXZhdGVkIGdsdWNvc2UKClJlc3VsdHM6IDEzNSwgMTcwLCAxNTAsIDEyMAoKQ29tbWVudHM6IEZhc3RpbmcsIGhvdXIgMSwgaG91ciAyLCBob3VyIDMKCgoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KU2VsZiBSZXBvcnRlZCBWaXRhbCBTdGF0aXN0aWNzCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKU291cmNlOiBTZWxmLUVudGVyZWQKCgoKVml0YWwgU3RhdGlzdGljIFR5cGU6IEJsb29kIFByZXNzdXJlCgpEYXRlOiAwNy8yMi8yMDExCgpUaW1lOiAzOjAwIFBNCgpSZWFkaW5nOiAxMjAvODAKCkNvbW1lbnRzOiAKCgoKVml0YWwgU3RhdGlzdGljIFR5cGU6IEdsdWNvc2UKCkRhdGU6IDAzLzIwLzIwMTIKClRpbWU6IDEyOjAwIFBNCgpSZWFkaW5nOiAxMTAKCkNvbW1lbnRzOiAKCgoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KRmFtaWx5IE1lZGljYWwgSGlzdG9yeQoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KClNvdXJjZTogU2VsZi1FbnRlcmVkCgoKCkZhbWlseSBNZW1iZXI6IEJyb3RoZXIKClR5cGU6IAoKRE9COjEvMTAvMTkxNQoKRE9EOiAKCkFnZTogCgpUeXBlOiBBbGxlcmd5CgpEZXNjcmlwdGlvbjogQW50aWFycnl0aG1pYQoKRGVzY3JpcHRpb246IEFudGliaW90aWMKCkRlc2NyaXB0aW9uOiBBbnRpY29udnVsc2FudHMKClR5cGU6IENvbmRpdGlvbgoKRGVzY3JpcHRpb246IEFsbGVyZ2llcwoKRGVzY3JpcHRpb246IEFsemhlaW1lcidzIERpc2Vhc2UKCkRlc2NyaXB0aW9uOiBBbmdpbmEgKEhlYXJ0IFBhaW4pCgpEZXNjcmlwdGlvbjogQ2F0YXJhY3RzCgoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KRHJ1Z3MKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpTb3VyY2U6IFNlbGYtRW50ZXJlZAoKCgpEcnVnIE5hbWU6IEFzcGlyaW4KClN1cHBseTogRGlhbHkKCk9yaWcgRHJ1ZyBFbnRyeTogQXNwaXJpbgoKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpQcmV2ZW50aXZlIFNlcnZpY2VzCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKU291cmNlOiBNeU1lZGljYXJlLmdvdgoKCgpEZXNjcmlwdGlvbjogRElBQkVURVMKCk5leHQgRWxpZ2libGUgRGF0ZTogMTAvMS8yMDExCgpMYXN0IERhdGUgb2YgU2VydmljZTogCgoKCkRlc2NyaXB0aW9uOiBQQVAgVEVTVCBEUgoKTmV4dCBFbGlnaWJsZSBEYXRlOiAxMC8xLzIwMTEKCkxhc3QgRGF0ZSBvZiBTZXJ2aWNlOiAKCgoKRGVzY3JpcHRpb246IEFCRE9NSU5BTCBBT1JUSUMgQU5FVVJZU00KCk5leHQgRWxpZ2libGUgRGF0ZTogNy8xLzIwMTIKCkxhc3QgRGF0ZSBvZiBTZXJ2aWNlOiAKCgoKRGVzY3JpcHRpb246IEFOTlVBTCBXRUxMTkVTUyBWSVNJVAoKTmV4dCBFbGlnaWJsZSBEYXRlOiAxLzEvMjAxMwoKTGFzdCBEYXRlIG9mIFNlcnZpY2U6IAoKCgpEZXNjcmlwdGlvbjogREVQUkVTU0lPTiBTQ1JFRU5JTkcKCk5leHQgRWxpZ2libGUgRGF0ZTogMTAvMTQvMjAxMgoKTGFzdCBEYXRlIG9mIFNlcnZpY2U6IAoKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpQcm92aWRlcnMKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpTb3VyY2U6IFNlbGYtRW50ZXJlZAoKCgpQcm92aWRlciBOYW1lOiBBTlkgQ0FSRQoKUHJvdmlkZXIgQWRkcmVzczogMTIzIEFueSBSZCwgQW55d2hlcmUsIE1EIDk5OTk5CgpUeXBlOiBOSEMKClNwZWNpYWx0eTogCgpNZWRpY2FyZSBQcm92aWRlcjogTm90IEF2YWlsYWJsZQoKCgpQcm92aWRlciBOYW1lOiBBTlkgSE9TUElUQUwxCgpQcm92aWRlciBBZGRyZXNzOiAxMjMgRHJpdmUsIEFueXdoZXJlLCBWQSAwMDAwMQoKVHlwZTogSE9TCgpTcGVjaWFsdHk6IAoKTWVkaWNhcmUgUHJvdmlkZXI6IE5vdCBBdmFpbGFibGUKClByb3ZpZGVyIE5hbWU6IEphbmUgRG9lCgpQcm92aWRlciBBZGRyZXNzOiAxMjMgUm9hZCwgQW55d2hlcmUsIFZBIDAwMDAxCgpUeXBlOiBQSFkKClNwZWNpYWx0eTogT3RoZXIKCk1lZGljYXJlIFByb3ZpZGVyOiBOb3QgQXZhaWxhYmxlCgoKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tClBoYXJtYWNpZXMKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpTb3VyY2U6IFNlbGYtRW50ZXJlZAoKCgpQaGFybWFjeSBOYW1lOiBQSEFSTUFDWSwgRUFTVCBTVFJFRVQgQU5ZV0hFUkUsIERDIDAwMDAyCgpQaGFybWFjeSBQaG9uZTogMDAwLTAwMC0wMDAxCgoKClBoYXJtYWN5IE5hbWU6IEFOWSBQSEFSTUFDWSwgV0VTVCBTVFJFRVQgQU5ZV0hFUkUsIFZBIDAwMDAxCgpQaGFybWFjeSBQaG9uZTogMDAwLTAwMC0wMDAyCgoKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tClBsYW5zCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKU291cmNlOiBNeU1lZGljYXJlLmdvdgoKCgpDb250cmFjdCBJRC9QbGFuIElEOiBIOTk5OS85OTk5CgpQbGFuIFBlcmlvZDogMDkvMDEvMjAxMSAtIGN1cnJlbnQKClBsYW4gTmFtZTogQSBNZWRpY2FyZSBQbGFuIFBsdXMgKEhNTykKCk1hcmtldGluZyBOYW1lOiBIZWFsdGhDYXJlIFBheWVyCgpQbGFuIEFkZHJlc3M6IDEyMyBBbnkgUm9hZCBBbnl0b3duIFBBIDAwMDAzCgpQbGFuIFR5cGU6IDMgLSBDb29yZGluYXRlZCBDYXJlIFBsYW4gKEhNTywgUFBPLCBQU08sIFNOUCkKCgoKQ29udHJhY3QgSUQvUGxhbiBJRDogUzk5OTkvMDAwCgpQbGFuIFBlcmlvZDogMDEvMDEvMjAxMCAtIGN1cnJlbnQKClBsYW4gTmFtZTogQSBNZWRpY2FyZSBSeCBQbGFuIChQRFApCgpNYXJrZXRpbmcgTmFtZTogQW5vdGhlciBIZWFsdGhDYXJlIFBheWVyCgpQbGFuIEFkZHJlc3M6IDEyMyBBbnkgUm9hZCBBbnl0b3duIFBBIDAwMDAzCgpQbGFuIFR5cGU6IDExIC0gTWVkaWNhcmUgUHJlc2NyaXB0aW9uIERydWcgUGxhbgoKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpFbXBsb3llciBTdWJzaWR5CgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKU291cmNlOiBNeU1lZGljYXJlLmdvdgoKCkVtcGxveWVyIFBsYW46IFNUQVRFIEhFQUxUSCBCRU5FRklUUyBQUk9HUkFNCgpFbXBsb3llciBTdWJzaWR5IFN0YXJ0IERhdGU6IDAxLzAxLzIwMTEKCkVtcGxveWVyIFN1YnNpZHkgRW5kIERhdGU6IDEyLzMxLzIwMTEKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpQcmltYXJ5IEluc3VyYW5jZQoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KClNvdXJjZTogTXlNZWRpY2FyZS5nb3YKCgoKTVNQIFR5cGU6IEVuZCBzdGFnZSBSZW5hbCBEaXNlYXNlIChFU1JEKQoKUG9saWN5IE51bWJlcjogMTIzNDU2Nzg5MAoKSW5zdXJlciBOYW1lOiBJbnN1cmVyMQoKSW5zdXJlciBBZGRyZXNzOiBQTyBCT1ggMDAwMCBBbnl0b3duLCBDTyAwMDAwMi0wMDAwCgpFZmZlY3RpdmUgRGF0ZTogMDEvMDEvMjAxMQoKVGVybWluYXRpb24gRGF0ZTogMDkvMzAvMjAxMQoKCgpNU1AgVHlwZTogRW5kIHN0YWdlIFJlbmFsIERpc2Vhc2UgKEVTUkQpCgpQb2xpY3kgTnVtYmVyOiAxMjM0NTY3ODkwMQoKSW5zdXJlciBOYW1lOiBJbnN1cmVyMgoKSW5zdXJlciBBZGRyZXNzOiAwMDAwIEFueSBST0FEIEFOWVdIRVJFLCBWQSAwMDAwMC0wMDAwCgpFZmZlY3RpdmUgRGF0ZTogMDEvMDEvMjAxMAoKVGVybWluYXRpb24gRGF0ZTogMTIvMzEvMjAxMAoKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpPdGhlciBJbnN1cmFuY2UKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpTb3VyY2U6IE15TWVkaWNhcmUuZ292CgoKCk1TUCBUeXBlOiAKClBvbGljeSBOdW1iZXI6IDAwMDAxCgpJbnN1cmVyIE5hbWU6IEluc3VyZXIKCkluc3VyZXIgQWRkcmVzczogMDAgQWRkcmVzcyBTVFJFRVQgQU5ZV0hFUkUsIFBBIDAwMDAwCgpFZmZlY3RpdmUgRGF0ZTogMTAvMDEvMTk4NAoKVGVybWluYXRpb24gRGF0ZTogMTEvMzAvMjAwOAoKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpDbGFpbSBTdW1tYXJ5CgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKU291cmNlOiBNeU1lZGljYXJlLmdvdgoKCgpDbGFpbSBOdW1iZXI6IDEyMzQ1Njc4OTAwMDAKClByb3ZpZGVyOiBObyBJbmZvcm1hdGlvbiBBdmFpbGFibGUgClByb3ZpZGVyIEJpbGxpbmcgQWRkcmVzczogICAgCgpTZXJ2aWNlIFN0YXJ0IERhdGU6IDEwLzE4LzIwMTIKClNlcnZpY2UgRW5kIERhdGU6IAoKQW1vdW50IENoYXJnZWQ6ICQ2MC4wMAoKTWVkaWNhcmUgQXBwcm92ZWQ6ICQzNC4wMAoKUHJvdmlkZXIgUGFpZDogJDI3LjIwCgpZb3UgTWF5IGJlIEJpbGxlZDogJDYuODAKCkNsYWltIFR5cGU6IFBhcnRCCgpEaWFnbm9zaXMgQ29kZSAxOiAzNTM0CkRpYWdub3NpcyBDb2RlIDI6IDczOTMKRGlhZ25vc2lzIENvZGUgMzogNzM5MgpEaWFnbm9zaXMgQ29kZSA0OiAzNTMzIAoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KQ2xhaW0gTGluZXMgZm9yIENsYWltIE51bWJlcjogMTIzNDU2Nzg5MDAwMAoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KCgoKTGluZSBudW1iZXI6ICAxCgpEYXRlIG9mIFNlcnZpY2UgRnJvbTogIDEwLzE4LzIwMTIKCkRhdGUgb2YgU2VydmljZSBUbzogIDEwLzE4LzIwMTIKClByb2NlZHVyZSBDb2RlL0Rlc2NyaXB0aW9uOiAgOTg5NDEgLSBDaGlyb3ByYWN0aWMgTWFuaXB1bGF0aXZlIFRyZWF0bWVudCAoQ210KTsgU3BpbmFsLCBUaHJlZSBUbyBGb3VyIFJlZ2lvbnMKCk1vZGlmaWVyIDEvRGVzY3JpcHRpb246ICBBVCAtIEFjdXRlIFRyZWF0bWVudCAoVGhpcyBNb2RpZmllciBTaG91bGQgQmUgVXNlZCBXaGVuIFJlcG9ydGluZyBTZXJ2aWNlIDk4OTQwLCA5ODk0MSwgOTg5NDIpCgpNb2RpZmllciAyL0Rlc2NyaXB0aW9uOiAgCgpNb2RpZmllciAzL0Rlc2NyaXB0aW9uOiAgCgpNb2RpZmllciA0L0Rlc2NyaXB0aW9uOiAgCgpRdWFudGl0eSBCaWxsZWQvVW5pdHM6ICAxCgpTdWJtaXR0ZWQgQW1vdW50L0NoYXJnZXM6ICAkNjAuMDAKCkFsbG93ZWQgQW1vdW50OiAgJDM0LjAwCgpOb24tQ292ZXJlZDogICQyNi4wMAoKUGxhY2Ugb2YgU2VydmljZS9EZXNjcmlwdGlvbjogIDExIC0gT2ZmaWNlCgpUeXBlIG9mIFNlcnZpY2UvRGVzY3JpcHRpb246ICAxIC0gTWVkaWNhbCBDYXJlCgpSZW5kZXJpbmcgUHJvdmlkZXIgTm86ICAwMDAwMDAxCgpSZW5kZXJpbmcgUHJvdmlkZXIgTlBJOiAgMTIzNDU2Nzg5CgoKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgoKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgoKCkNsYWltIE51bWJlcjogMTIzNDU2Nzg5MDAwMDBWQUEKClByb3ZpZGVyOiBObyBJbmZvcm1hdGlvbiBBdmFpbGFibGUKIApQcm92aWRlciBCaWxsaW5nIEFkZHJlc3M6ICAgIAoKU2VydmljZSBTdGFydCBEYXRlOiAwOS8yMi8yMDEyCgpTZXJ2aWNlIEVuZCBEYXRlOiAKCkFtb3VudCBDaGFyZ2VkOiAkNTA0LjgwCgpNZWRpY2FyZSBBcHByb3ZlZDogJDUwNC44MAoKUHJvdmlkZXIgUGFpZDogJDEyNi4zMQoKWW91IE1heSBiZSBCaWxsZWQ6ICQzOC44NAoKQ2xhaW0gVHlwZTogT3V0cGF0aWVudAoKRGlhZ25vc2lzIENvZGUgMTogNTY0MDAKRGlhZ25vc2lzIENvZGUgMjogNzI0NQpEaWFnbm9zaXMgQ29kZSAzOiBWMTU4OAoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KQ2xhaW0gTGluZXMgZm9yIENsYWltIE51bWJlcjogMTIzNDU2Nzg5MDAwMDBWQUEKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgoKCkxpbmUgbnVtYmVyOiAgMQoKRGF0ZSBvZiBTZXJ2aWNlIEZyb206ICAwOS8yMi8yMDEyCgpSZXZlbnVlIENvZGUvRGVzY3JpcHRpb246IDAyNTAgLSBHZW5lcmFsIENsYXNzaWZpY2F0aW9uIFBIQVJNQUNZCgpQcm9jZWR1cmUgQ29kZS9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgMS9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgMi9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgMy9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgNC9EZXNjcmlwdGlvbjogIAoKUXVhbnRpdHkgQmlsbGVkL1VuaXRzOiAgMQoKU3VibWl0dGVkIEFtb3VudC9DaGFyZ2VzOiAgJDE0LjMwCgpBbGxvd2VkIEFtb3VudDogICQxNC4zMAoKTm9uLUNvdmVyZWQ6ICAkMC4wMAoKCgpMaW5lIG51bWJlcjogIDIKCkRhdGUgb2YgU2VydmljZSBGcm9tOiAgMDkvMjIvMjAxMgoKUmV2ZW51ZSBDb2RlL0Rlc2NyaXB0aW9uOiAwMzIwIC0gR2VuZXJhbCBDbGFzc2lmaWNhdGlvbiBEWCBYLVJBWQoKUHJvY2VkdXJlIENvZGUvRGVzY3JpcHRpb246ICA3NDAyMCAtIFJhZGlvbG9naWMgRXhhbWluYXRpb24sIEFiZG9tZW47IENvbXBsZXRlLCBJbmNsdWRpbmcgRGVjdWJpdHVzIEFuZC9PciBFcmVjdCBWaWV3cwoKTW9kaWZpZXIgMS9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgMi9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgMy9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgNC9EZXNjcmlwdGlvbjogIAoKUXVhbnRpdHkgQmlsbGVkL1VuaXRzOiAgMQoKU3VibWl0dGVkIEFtb3VudC9DaGFyZ2VzOiAgJDE3NS41MAoKQWxsb3dlZCBBbW91bnQ6ICAkMTc1LjUwCgpOb24tQ292ZXJlZDogICQwLjAwCgoKCkxpbmUgbnVtYmVyOiAgMwoKRGF0ZSBvZiBTZXJ2aWNlIEZyb206ICAwOS8yMi8yMDEyCgpSZXZlbnVlIENvZGUvRGVzY3JpcHRpb246IDA0NTAgLSBHZW5lcmFsIENsYXNzaWZpY2F0aW9uIEVNRVJHIFJPT00KClByb2NlZHVyZSBDb2RlL0Rlc2NyaXB0aW9uOiAgOTkyODMgLSBFbWVyZ2VuY3kgRGVwYXJ0bWVudCBWaXNpdCBGb3IgVGhlIEV2YWx1YXRpb24gQW5kIE1hbmFnZW1lbnQgT2YgQSBQYXRpZW50LCBXaGljaCBSZXF1aXJlcyBUaAoKTW9kaWZpZXIgMS9EZXNjcmlwdGlvbjogIDI1IC0gU2lnbmlmaWNhbnQsIFNlcGFyYXRlbHkgSWRlbnRpZmlhYmxlIEV2YWx1YXRpb24gQW5kIE1hbmFnZW1lbnQgU2VydmljZSBCeSBUaGUgU2FtZSBQaHlzaWNpYW4gT24KCk1vZGlmaWVyIDIvRGVzY3JpcHRpb246ICAKCk1vZGlmaWVyIDMvRGVzY3JpcHRpb246ICAKCk1vZGlmaWVyIDQvRGVzY3JpcHRpb246ICAKClF1YW50aXR5IEJpbGxlZC9Vbml0czogIDEKClN1Ym1pdHRlZCBBbW91bnQvQ2hhcmdlczogICQzMTUuMDAKCkFsbG93ZWQgQW1vdW50OiAgJDMxNS4wMAoKTm9uLUNvdmVyZWQ6ICAkMC4wMAoKCgpMaW5lIG51bWJlcjogIDQKCkRhdGUgb2YgU2VydmljZSBGcm9tOiAgCgpSZXZlbnVlIENvZGUvRGVzY3JpcHRpb246IDAwMDEgLSBUb3RhbCBDaGFyZ2VzCgpQcm9jZWR1cmUgQ29kZS9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgMS9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgMi9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgMy9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgNC9EZXNjcmlwdGlvbjogIAoKUXVhbnRpdHkgQmlsbGVkL1VuaXRzOiAgMAoKU3VibWl0dGVkIEFtb3VudC9DaGFyZ2VzOiAgJDUwNC44MAoKQWxsb3dlZCBBbW91bnQ6ICAkNTA0LjgwCgpOb24tQ292ZXJlZDogICQwLjAwCgpDbGFpbSBOdW1iZXI6IDEyMzQ1Njc4OTAxMjMKClByb3ZpZGVyOiBObyBJbmZvcm1hdGlvbiBBdmFpbGFibGUKClByb3ZpZGVyIEJpbGxpbmcgQWRkcmVzczogICAgCgpTZXJ2aWNlIFN0YXJ0IERhdGU6IDEyLzAxLzIwMTIKClNlcnZpY2UgRW5kIERhdGU6IAoKQW1vdW50IENoYXJnZWQ6ICogTm90IEF2YWlsYWJsZSAqCgpNZWRpY2FyZSBBcHByb3ZlZDogKiBOb3QgQXZhaWxhYmxlICoKClByb3ZpZGVyIFBhaWQ6ICogTm90IEF2YWlsYWJsZSAqCgpZb3UgTWF5IGJlIEJpbGxlZDogKiBOb3QgQXZhaWxhYmxlICoKCkNsYWltIFR5cGU6IFBhcnRCCgpEaWFnbm9zaXMgQ29kZSAxOiA3MzkyCkRpYWdub3NpcyBDb2RlIDI6IDcyNDEKRGlhZ25vc2lzIENvZGUgMzogNzM5MwpEaWFnbm9zaXMgQ29kZSA0OiA3MzkxCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpDbGFpbSBMaW5lcyBmb3IgQ2xhaW0gTnVtYmVyOiAxMjM0NTY3ODkwMTIzCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKCgpMaW5lIG51bWJlcjogIDEKCkRhdGUgb2YgU2VydmljZSBGcm9tOiAgMTIvMDEvMjAxMgoKRGF0ZSBvZiBTZXJ2aWNlIFRvOiAgMTIvMDEvMjAxMgoKUHJvY2VkdXJlIENvZGUvRGVzY3JpcHRpb246ICA5ODk0MSAtIENoaXJvcHJhY3RpYyBNYW5pcHVsYXRpdmUgVHJlYXRtZW50LCAzIFRvIDQgU3BpbmFsIFJlZ2lvbnMKCk1vZGlmaWVyIDEvRGVzY3JpcHRpb246ICBHQSAtIFdhaXZlciBPZiBMaWFiaWxpdHkgU3RhdGVtZW50IElzc3VlZCBBcyBSZXF1aXJlZCBCeSBQYXllciBQb2xpY3ksIEluZGl2aWR1YWwgQ2FzZQoKTW9kaWZpZXIgMi9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgMy9EZXNjcmlwdGlvbjogIAoKTW9kaWZpZXIgNC9EZXNjcmlwdGlvbjogIAoKUXVhbnRpdHkgQmlsbGVkL1VuaXRzOiAgMQoKU3VibWl0dGVkIEFtb3VudC9DaGFyZ2VzOiAgKiBOb3QgQXZhaWxhYmxlICoKCkFsbG93ZWQgQW1vdW50OiAgKiBOb3QgQXZhaWxhYmxlICoKCk5vbi1Db3ZlcmVkOiAgKiBOb3QgQXZhaWxhYmxlICoKClBsYWNlIG9mIFNlcnZpY2UvRGVzY3JpcHRpb246ICAxMSAtIE9mZmljZQoKVHlwZSBvZiBTZXJ2aWNlL0Rlc2NyaXB0aW9uOiAgMSAtIE1lZGljYWwgQ2FyZQoKUmVuZGVyaW5nIFByb3ZpZGVyIE5vOiAgMTIzNDU2CgpSZW5kZXJpbmcgUHJvdmlkZXIgTlBJOiAgMTIzNDU2Nzg5CgoKCkxpbmUgbnVtYmVyOiAgMgoKRGF0ZSBvZiBTZXJ2aWNlIEZyb206ICAxMi8wMS8yMDEyCgpEYXRlIG9mIFNlcnZpY2UgVG86ICAxMi8wMS8yMDEyCgpQcm9jZWR1cmUgQ29kZS9EZXNjcmlwdGlvbjogIEcwMjgzIC0gRWxlY3RyaWNhbCBTdGltdWxhdGlvbiAoVW5hdHRlbmRlZCksIFRvIE9uZSBPciBNb3JlIEFyZWFzIEZvciBJbmRpY2F0aW9uKFMpIE90aGVyIFRoYW4gV291bmQKCk1vZGlmaWVyIDEvRGVzY3JpcHRpb246ICBHWSAtIEl0ZW0gT3IgU2VydmljZSBTdGF0dXRvcmlseSBFeGNsdWRlZCwgRG9lcyBOb3QgTWVldCBUaGUgRGVmaW5pdGlvbiBPZiBBbnkgTWVkaWNhcmUgQmVuZWZpdCBPciwKCk1vZGlmaWVyIDIvRGVzY3JpcHRpb246ICAKCk1vZGlmaWVyIDMvRGVzY3JpcHRpb246ICAKCk1vZGlmaWVyIDQvRGVzY3JpcHRpb246ICAKClF1YW50aXR5IEJpbGxlZC9Vbml0czogIDEKClN1Ym1pdHRlZCBBbW91bnQvQ2hhcmdlczogICogTm90IEF2YWlsYWJsZSAqCgpBbGxvd2VkIEFtb3VudDogICogTm90IEF2YWlsYWJsZSAqCgpOb24tQ292ZXJlZDogICogTm90IEF2YWlsYWJsZSAqCgpQbGFjZSBvZiBTZXJ2aWNlL0Rlc2NyaXB0aW9uOiAgMTEgLSBPZmZpY2UKClR5cGUgb2YgU2VydmljZS9EZXNjcmlwdGlvbjogIDEgLSBNZWRpY2FsIENhcmUKClJlbmRlcmluZyBQcm92aWRlciBObzogIDEyMzQ1NgoKUmVuZGVyaW5nIFByb3ZpZGVyIE5QSTogIDEyMzQ1Njc4OQoKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpDbGFpbSBMaW5lcyBmb3IgQ2xhaW0gTnVtYmVyOiAxMjM0NTY3ODkwMTIKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgoKCkNsYWltIFR5cGU6IFBhcnQgRAoKQ2xhaW0gTnVtYmVyOiAxMjM0NTY3ODkwMTIKCkNsYWltIFNlcnZpY2UgRGF0ZTogMTEvMTcvMjAxMQoKUGhhcm1hY3kgLyBTZXJ2aWNlIFByb3ZpZGVyOiAxMjM0NTY3ODkKClBoYXJtYWN5IE5hbWU6IFBIQVJNQUNZMiAjMDAwMDAKCkRydWcgQ29kZTogMDAwOTMwMTM1MDUKCkRydWcgTmFtZTogQ0FSVkVESUxPTAoKRmlsbCBOdW1iZXI6IDAKCkRheXMnIFN1cHBseTogMzAKClByZXNjcmliZXIgSWRlbnRpZmVyOiAxMjM0NTY3ODkKClByZXNjcmliZXIgTmFtZTogSmFuZSBEb2UKCgoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KQ2xhaW0gTGluZXMgZm9yIENsYWltIE51bWJlcjogMTIzNDU2Nzg5MDExCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKCgpDbGFpbSBUeXBlOiBQYXJ0IEQKCkNsYWltIE51bWJlcjogMTIzNDU2Nzg5MDExCgpDbGFpbSBTZXJ2aWNlIERhdGU6IDExLzIzLzIwMTEKClBoYXJtYWN5IC8gU2VydmljZSBQcm92aWRlcjogMTIzNDU2Nzg5MAoKUGhhcm1hY3kgTmFtZTogUEhBUk1BQ1kzICMwMDAwMAoKRHJ1ZyBDb2RlOiAwMDc4MTIyMzMxMAoKRHJ1ZyBOYW1lOiBPTUVQUkFaT0xFCgpGaWxsIE51bWJlcjogNAoKRGF5cycgU3VwcGx5OiAzMAoKUHJlc2NyaWJlciBJZGVudGlmZXI6IDEyMzQ1Njc4OQoKUHJlc2NyaWJlciBOYW1lOiBKYW5lIERvZQoKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKCgo=","base64").toString();
        var result = bb.parseText(data);

        // check validation
        var val = bb.validator.validateDocumentModel(result);

        // generate ccda
        var xml = bbg.generateCCD(result);

        // parse generated ccda
        var result2 = bb.parseString(xml);

        // re-generate
        var xml2 = bbg.generateCCD(result2);

        delete result.errors;
        delete result2.errors;
        delete result.data.claims;
        delete result2.data.claims;
        delete result.data.plan_of_care;
        delete result2.data.plan_of_care;
        delete result.data.providers;
        delete result2.data.providers;

        assert.deepEqual(result2.data, result.data);
    });

    it('skewed sample data from app should still be same', function () {
        //var data = fs.readFileSync("./sample.JSON").toString();


        //convert string into JSON 
        var result = JSON.parse(data);

        // check validation
        var val = bb.validator.validateDocumentModel(result);

        // generate ccda

        //console.log(result.demographics);
        var xml = bbg.generateCCD(result);

        // parse generated ccda
        var result2 = bb.parseString(xml);

        // re-generate
        var xml2 = bbg.generateCCD(result2);

        delete result.errors;
        delete result2.errors;

        //assert.deepEqual(result2, result);
    });
});

}).call(this,require("buffer").Buffer,"/test/sample_runs")
},{"../../index":2,"blue-button":"blue-button","buffer":67,"chai":35,"path":71}]},{},[74]);