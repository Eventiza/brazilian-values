import moment from 'moment';

/**
 * Valida se o construtor do valor é o especificado.
 * @example ```
 * (12, 'Number') => true
 * ({ name: 'Lucas' }, 'Object') => true
 * ([2, 3], 'Set') => false
 * ```
 * @param {*} value
 * @param {String} constructor
 * @returns {Boolean}
 */
var is = function (value, constructor) {
  var isEquals = constructor === getConstructor(value);
  return isEquals
};

var isCPF = function (cpf) {
  var isInvalid = function (cpf, rest, pos) { return rest !== parseInt(cpf.substring(pos, pos + 1)); };

  var sumDigit = function (cpf, digit) { return 11 - (cpf.substring(0, digit).split('').reduce(function (acc, curr, index) {
    acc += parseInt(curr) * ((digit + 1) - index);
    return acc
  }, 0) % 11); };

  var getRest = function (sum) { return sum > 9 ? 0 : sum; };

  if (!is(cpf, 'String')) { return false }

  cpf = cpf.replace(/[\D]/gi, '');

  if (!cpf.match(/^\d+$/)) { return false }

  if (cpf === '00000000000' || cpf.length !== 11) { return false }

  if (isInvalid(cpf, getRest(sumDigit(cpf, 9)), 9)) { return false }

  if (isInvalid(cpf, getRest(sumDigit(cpf, 10)), 10)) { return false }

  return true
};

/**
 * Valida se é uma data com o formato especificado ou, quando não especificado,
 * valida se é um dos formatos 'DD/MM/YYYY', 'DD-MM-YYYY' e 'YYYY-MM-DD'.
 * @example ```
 * ('3/102/2006') => false
 * ('31/02/2006') => false
 * ('21/12/2006') => true
 * ('21/12/2006', 'YYYY-MM-DD') => false
 * ```
 * @param {String} date
 * @param {String} [format]
 * @returns {Boolean}
 */
var isDate = function (date, format) {
  if ( format === void 0 ) format = null;

  var from = format || getDateFormat(date);
  var isValid = from ? moment(date, format).isValid() : false;
  return isValid
};


var $validate = Object.freeze({
	is: is,
	isCPF: isCPF,
	isDate: isDate
});

/**
 * Obtém o formato da data ou null se não for possível identificar.
 * @example ```
 * ('2000-21-12') => 'YYYY-DD-MM'
 * ('21-12-2000') => 'DD-MM-YYYY'
 * ('21/12/2000') => 'DD/MM/YYYY'
 * ('12/21/2000') => 'DD/MM/YYYY'
 * ('2000/12/21') => null
 * ```
 * @param {String} date
 * @returns {String}
 */
var getDateFormat = function (date) {
  var isValid = is(date, 'String') && date.trim().length === 10;
  var format = !isValid ? null
    : /^\d{4}-\d{2}-\d{2}$/.test(date) ? 'YYYY-MM-DD'
    : /^\d{2}-\d{2}-\d{4}$/.test(date) ? 'DD-MM-YYYY'
    : /^\d{2}\/\d{2}\/\d{4}$/.test(date) ? 'DD/MM/YYYY'
    : null;

  return format
};

/**
 * Obtém o construtor do valor.
 * @param {*} value
 * @returns {String}
 */
var getConstructor = function (value) {
  var string = Object.prototype.toString.call(value);
  var ref = /\[object (.*?)\]/.exec(string);
  var constructor = ref[1];
  return constructor
};

/**
 * Usando um valor inicial, encadeia uma função e retorna seu resultado.
 * @param {A} initial
 * @param {function(A):function} callback
 * @param {Array.<*>} params
 * @returns {B}
 * @template A, B
 */
var chain = function (initial, callback, params) {
  var value = params.reduce(function (value, args) {
    return callback(value).apply(value, [].concat( args ))
  }, initial);

  return value
};

/**
 * Faz em forma de corrente o replace do texto usando os argumentos especificados.
 * @param {String} text
 * @param {Array.<*>} args
 * @returns {String}
 */
var replace = function (text, args) { return chain(text, function (text) { return text.replace; }, args); };

/**
 * Transforma um valor para a formatação de CPF.
 * @example ```
 * ('00000000000') => '000.000.000-00'
 * ('12345678') => '123.456.78'
 * ('Abacaxi') => null
 * ```
 * @param {String} cpf
 * @returns {String}
 */
var toCPF = function (cpf) {
  var isValid = is(cpf, 'String') && /\d/.test(cpf);
  var formatted = !isValid ? null : replace(cpf, [
    [/\D/g, ''],
    [/(\d{3})(\d)/, '$1.$2'],
    [/(\d{3})(\d)/, '$1.$2'],
    [/(\d{3})(\d{1,2})$/, '$1-$2']
  ]);
  return formatted
};

/**
 * Transforma um valor para a formatação de RG.
 * @example ```
 * ('000000000') => '00.000.000-0'
 * ('12345678') => '123.456.78'
 * ('Abacaxi') => null
 * ```
 * @param {String} rg
 * @returns {String}
 */
var toRG = function (rg) {
  var isValid = is(rg, 'String') && /\d/.test(rg);
  var formatted = !isValid ? null : replace(rg, [
    [/[^\d|A|B|X]/g, ''],
    [/(\d{2})(\d)/, '$1.$2'],
    [/(\d{3})(\d)/, '$1.$2'],
    [/(\d{3})(\d{1})$/, '$1-$2']
  ]);
  return formatted
};

/**
 * Formata um valor para a formatação de moeda.
 * @example ```
 * ('1200') => 'R$ 1.200,00'
 * (15.50) => 'R$ 15,50'
 * ('Abacaxi') => null
 * ```
 * @param {String} number
 * @returns {String}
 */
var toMoney = function (number) {
  var isValid = is(number, 'Number') || (is(number, 'String') && !isNaN(number));
  var formatted = !isValid ? null : 'R$ ' + replace(+(number).toFixed(2), [
    ['.', ','],
    [/(\d)(?=(\d{3})+(?!\d))/g, '$1.']
  ]);
  return formatted
};

/**
 * Obtém a quantidade de anos a partir da data.
 * @example ```
 * ('21-12-2006') => 10
 * ('2000-12-21') => 16
 * ('Abacaxi') => null
 * ```
 * @param {String} date
 * @returns {Number}
 */
var toYears = function (date) {
  var from = moment(toDate(date), 'DD/MM/YYYY');
  var years = moment().diff(from, 'years');
  return years
};

/**
 * Formata uma data 'YYYY-MM-DD' ou 'DD-MM-YYYY' em 'DD/MM/YYYY'. Transforma
 * a data em 'YYYY-MM-DD' caso o segundo parâmetro seja "true".
 * @example ```
 * ('21-12-2006') => '21/12/2006'
 * ('2006-12-21') => '21/12/2006'
 * ('21/12/2006') => '21/12/2006'
 * ('21/12/2006', true) => '2006-12-21'
 * ('2006-12-21', true) => '2006-12-21'
 * ('2006/12/21') => null
 * ```
 * @param {String} date
 * @param {Boolean} [toDatabase] Força o formato 'YYYY-MM-DD'.
 * @returns {String}
 */
var toDate = function (date, toDatabase) {
  if ( toDatabase === void 0 ) toDatabase = false;

  var from = getDateFormat(date);
  var isValid = !!from;
  var to = toDatabase ? 'YYYY-MM-DD' : 'DD/MM/YYYY';
  var formatted = !isValid ? null : moment(date, from).format(to);
  return formatted
};

/**
 * Faz uma verificação simples e coloca o caractere para vazio caso o valor seja
 * vazio (null, undefined, '').
 * @param {*} value
 * @param {String} char
 * @returns {String}
 */
var toEmpty = function (value, char) {
  if ( char === void 0 ) char = '-';

  return value || char;
};


var $format = Object.freeze({
	toCPF: toCPF,
	toRG: toRG,
	toMoney: toMoney,
	toYears: toYears,
	toDate: toDate,
	toEmpty: toEmpty
});

/**
 * Opções do plugin.
 * @typedef {Object} Options
 * @property {Boolean} formatters
 * @property {Boolean} formatFilters
 * @property {Boolean} validators
 */

/**
 * Adiciona as funções auxiliares definidas no protótipo do Vue, e
 * consequentemente aos componentes.
 * @param {Vue} Vue
 * @param {Options} options
 */
var install = function (Vue, options) {
  if ( options === void 0 ) options = {};

  if (options.formatters) {
    Vue.prototype.$format = $format;
  }

  if (options.formatFilters) {
    Object.keys($format).forEach(function (name) {
      var handler = $format[name];
      Vue.filter(name, handler);
    });
  }

  if (options.validators) {
    Vue.prototype.$validate = $validate;
  }
};

export { $format as format, $validate as validate };export default install;