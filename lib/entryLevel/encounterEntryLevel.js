"use strict";

var fieldLevel = require('../fieldLevel');
var leafLevel = require('../leafLevel');
var contentModifier = require("../contentModifier");

var sharedEntryLevel = require("./sharedEntryLevel");

var key = contentModifier.key;
var required = contentModifier.required;
var dataKey = contentModifier.dataKey;

var encounterDiagnosis = {
    key: "entryRelationship",
    attributes: {
        typeCode: "SUBJ"
    },
    content: [{
        key: "act",
        attributes: {
            classCode: "ACT",
            moodCode: "EVN"
        },
        content: [
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.80", "2015-08-01"),
            fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.19"),
            fieldLevel.uniqueId,
            fieldLevel.id,
            {
                key: "code",
                attributes: {
                    code: "29308-4",
                    codeSystem: "2.16.840.1.113883.6.1",
                    codeSystemName: "LOINC",
                    displayName: "ENCOUNTER DIAGNOSIS"
                },
                dataKey: "code",
                required: true
            },
            [fieldLevel.effectiveTime, required],
            {
                key: "entryRelationship",
                attributes: {
                    typeCode: "SUBJ",
                    inversionInd: "false"
                },
                content: [{
                    key: "observation",
                    attributes: {
                        classCode: "OBS",
                        moodCode: "EVN"
                    },
                    content: [
                        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.4", "2015-08-01"),
                        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.4"),
                        fieldLevel.id,
                        {
                            key: "code",
                            attributes: {
                                code: "404684003",
                                displayName: "Finding",
                                codeSystem: "2.16.840.1.113883.6.96",
                                codeSystemName: "SNOMED CT"
                            },
                            content: [{
                                key: "translation",
                                attributes: {
                                    code: "75321-0",
                                    codeSystem: "2.16.840.1.113883.6.1",
                                    codeSystemName: "LOINC",
                                    displayName: "Clinical finding"
                                }
                            }]
                        },
                        fieldLevel.statusCodeCompleted,
                        fieldLevel.effectiveTime,
                        {
                            key: "value",
                            attributes: [
                                leafLevel.typeCD,
                                leafLevel.code
                            ],
                            dataKey: "value"
                        }
                    ]
                }]
            }
        ]
    }],
    dataKey: "findings"
}

exports.encounterActivities = {
    key: "encounter",
    attributes: {
        classCode: "ENC",
        moodCode: "EVN"
    },
    content: [
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.49", "2015-08-01"),
        fieldLevel.templateId("2.16.840.1.113883.10.20.22.4.49"),
        fieldLevel.uniqueId,
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
        },
        encounterDiagnosis
    ],
    notImplemented: [
        // "entryRelationship:encounterDiagnosis",
        "dishargeDispositionCode"
    ]
};
