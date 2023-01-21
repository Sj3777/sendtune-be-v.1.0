/*
@author DB
@class request-validator
@desc ExpressJS middleware for validating RESt API request
*/
module.exports = function (req, res, next) {
    req.validate=function (requiredFields, reqData, alternate) {
        var TRA=function (a,b) {
            return b;
        };
        var _this = this;
        var reqData = reqData || _this.body.reqData || {};
        var isValid = true;
        for (var i = 0; i < requiredFields.length; i++) {
            var field = requiredFields[i];
            var requiredType = field.type.toString().trim().toUpperCase();
            var value = null;
            if (reqData[field.field] == null) {
                value = '';
            } else {
                value = reqData[field.field];
            }
            var actualType = (typeof reqData[field.field]).toString().toUpperCase();
            if(reqData[field.field]===null){
                actualType='UNDEFINED';
            }
            field.isRequired=field.isRequiredIf&&typeof field.isRequiredIf=='function'?field.isRequiredIf(value):field.isRequired;
            if (field.isRequired && (actualType == 'UNDEFINED' || value.toString().trim() == '')) {
                if (field.alternate) {
                    isValid = _this.validate(Array.isArray(field.alternate) ? field.alternate : [field.alternate], null, field);
                } else {
                    res.addError('ERR001', alternate ? field.field + ' or ' + alternate.field : field.field);
                    isValid = false;
                }
            }
            let length=Array.isArray(value)?value.length:value.toString().trim().length;
            if (field.min && length < field.min && actualType != 'UNDEFINED') {
                res.addError('ERR002', field.field, 'value is too small for {field}, required length is {val}', {
                    val: field.min,
                    field:field.field
                });
                isValid = false;
            }
            if (field.max && length > field.max && actualType != 'UNDEFINED') {
                res.addError('ERR003', field.field, 'Value is to large for {field}, required maximum length is {val}', {
                    val: field.max,
                    field:field.field
                });
                isValid = false;
            }
            switch (requiredType) {
                case "CUSTOM":
                    var err={};
                    if(!field.validate(value,err)){
                        res.addError(err.code, field.field, err.message, err.params);
                        isValid = false;
                    }
                    break;
                case "AMOUNT":
                    if (isNaN(value) && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "{field} must be type of {type}", {
                            type: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    }
                    if(!isNaN(value)){
                        var valParts=value.toString().split('.');
                        if(valParts.length>1){
                            if(valParts[1].length>2){
                                res.addError('ERR005', field.field, "Amount is not accepted", {
                                    type: requiredType.toLowerCase()
                                });
                                isValid = false;
                            }
                        }
                    }
                    break;
                case "NUMBER":
                    if(reqData[field.field]===''){
                        reqData[field.field] = null;
                    }
                    if (isNaN(value) && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "{field} must be type of {type}", {
                            type: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    }
                    break;
                case "STRING":
                    if (actualType != requiredType && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "{field} must be type of  {type}", {
                            type: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    }
                    break;
                case "PASSWORD":
                    //var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
                    //!re.test(value)
                    if ((value || '').toString().length<6 && actualType != 'UNDEFINED') {
                        //if (actualType != requiredType && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Password must have minimum 6 characters", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                    break;
                case "EMAIL":
                    var re = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{1,8})+$/;
                    if (!re.test(value) && actualType != 'UNDEFINED') {
                        res.addError('ERR062', '', '', {
                            type: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    }
                    break;
                case "MOBILE":
                    value=value || '';
                    var p=value.toString().split('-');
                    if (!(p.length==2 && value.indexOf('-')>=1 && value.indexOf('-')<=(value.length-2)) && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "{field} must be type of  {type}", {
                            type: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    }
                    break;
                case "DATE":
                case "DATETIME":
                    if (value && isNaN(new Date((value)).getTime())) {
                        res.addError('ERR004', field.field, "{field} must be type of  {type}", {
                            type: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    }
                    break;
                case "ENUM":
                    if (field.isRequired && field.enumValues && field.enumValues.indexOf(value) < 0) {
                        res.addError('ERR004', field.field, "Value of {field} must be in {val}", {
                            val: field.enumValues.join(', '),
                            field:field.field
                        });
                        isValid = false;
                    }
                    break;
                case "FREEOBJECT":
                    if (actualType != 'OBJECT' && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "{field} must be type of {val}", {
                            val: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    }
                    break;
                case "OBJECT":
                    if (actualType != requiredType && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "{field} must be type of  {type}", {
                            type: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    } else {
                        if (!_this.validate(field.items, value))
                            isValid = false;
                    }
                    break;
                case "OBJECTARRAY":
                    actualType=actualType+(Array.isArray(value)?'ARRAY':'');
                    if (actualType != requiredType && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "{field} must be type of {type}", {
                            type: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    } else {
                        if (!_this.validate(field.items, value[0]) && value && value.length){
                            res.addError('ERR004', field.field, "{field} must be type of {type}", {
                                type: requiredType.toLowerCase(),
                                field:field.field
                            });
                            isValid = false;
                        }

                    }
                    break;
                case "ARRAY":
                    if (!Array.isArray(value) && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "{field} must be type of {type}", {
                            type: requiredType.toLowerCase(),
                            field:field.field
                        });
                        isValid = false;
                    }
                    break;
            }
        }
        return isValid;
    };
    next();
}