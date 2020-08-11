import { JsonConvert, ValueCheckingMode } from 'json2typescript';

let jsonConvert = new JsonConvert();

jsonConvert.ignorePrimitiveChecks = false;
jsonConvert.ignoreRequiredCheck = true;
jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL;

export default jsonConvert;
