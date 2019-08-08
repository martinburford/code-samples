// Library to export JSON to CSV files on the file system

const fs = require('fs');
const json2csv = require('json2csv');
const rimraf = require('rimraf');

const options = {
	fields: {
		employeeTotals: ['socCode', 'employeeTotal'],
		probabilityTotals: ['socCode', 'employeeTotal', 'growthEmployees', 'growthEmployeePercentage', 'uncertainEmployees', 'uncertainEmployeePercentage', 'shrinkEmployees', 'shrinkEmployeePercentage', 'socTitle'],
		socGroups: ['socLevel', 'socCode', 'level4SocCode', 'level4SocProbabilityOfGrowth']
	},
	paths: {
		input: {
			uk: {
				level4SocCodes: require('./uk/soc4-probability-percentages.json'),
				soc4CodeTitles: require('./uk/all-soc-code-names.json')
			},
			us: {
				level4SocCodes: require('./us/soc4-probability-percentages.json'),
				soc4CodeTitles: require('./us/all-soc-code-names.json')
			}
		},
		output: {
			uk: './../../dist/assets/json/occupations/uk/',
			us: './../../dist/assets/json/occupations/us/'
		}
	},
	socEmployeeTotals: {
		uk: {},
		us: {}
	},
	socProbabilities: {
		uk: {},
		us: {}
	}
}

/**
 * Calculate the probability statistics for a group at a given level
 * @function generateProbabilityStatsForGroup
 * @param {number} socLevel - 1, 2, 3 or 4
 * @param {string} country - Either 'uk' || 'us'
 * @param {boolean} [generateJSONForWeb] - Whether to generate JSON files for web consumption (within /dist) or not
 */
const generateProbabilityStatsForGroup = (socLevel, country, generateJSONForWeb) => {
	let filterType;

	switch(socLevel){
		case 1: 
			filterType = 'Major Group';
			break;
		case 2: 
			filterType = 'Sub-Major Group';
			break;
		case 3: 
			filterType = 'Minor Group';
			break;
		case 4: 
			filterType = 'Unit Group';
			break;
	}

	retrieveAllSocTitles(socLevel, country).then((requestedLevelData) => {
		const destinationFolder = './' + country + '/csv/soc-level-' + socLevel + '/'; // soc-level-1 / soc-level-2 / soc-level-3 / soc-level-4

		console.log('**** ' + country.toUpperCase() + ' probabilities (SOC level: ' + socLevel + ') ****');

		requestedLevelData.forEach((socElement) => {
			let socGroup = options.paths.input[country].level4SocCodes.filter((socLevel4Element) => {
				if(country === 'uk'){
					return socLevel4Element.SOC4.toString().substr(0, socLevel) == socElement[filterType];
				} else if(country === 'us'){
					switch(socLevel){
						case 1:
							return socLevel4Element.SOC4.toString().substr(0, 2) == socElement[filterType].substr(0, 2);
							break;
						case 2:
							return socLevel4Element.SOC4.toString().substr(0, 4) == socElement[filterType].substr(0, 4);
							break;
						case 3:
						 	return socLevel4Element.SOC4.toString().substr(0, 6) == socElement[filterType].substr(0, 6);
							break;
						case 4:
							return socLevel4Element.SOC4.toString().substr(0, 7) == socElement[filterType].substr(0, 7);
							break;
					}
				}
			}).map((socMappedElement) => {
				return {
					employmentTotal: socMappedElement.Employment,
					socLevel: socLevel,
					socCode: socElement[filterType],
					level4SocCode: socMappedElement.SOC4,
					level4SocProbabilityOfGrowth: socMappedElement.Probability
				};
			});

			if(!fs.existsSync(destinationFolder)){
				fs.mkdirSync(destinationFolder);
			}

			// Generate a CSV file for each inidivual SOC code, level 1, 2, 3 or 4
			const destinationFileName = socElement[filterType] + '.csv';
			const csv = json2csv({data: socGroup, fields: options.fields.socGroups});
			const path = destinationFolder + destinationFileName;

			fs.writeFileSync(path, csv);
			console.log('CSV file written to: ', path);

			// For each SOC level, create a separate file which calculates the groups probability, based on the accumulated statistics of its children
			const socGroupEmployeesBreakdown = socGroup.map((socElement) => {
				// Unlikely to grow (employees total)
				let employeesUnlikelyToGrow = 0;
				let employeesLikelyToGrow = 0;

				if((socElement.level4SocProbabilityOfGrowth*100) < 30){
					employeesUnlikelyToGrow = socElement.employmentTotal;
				}

				if((socElement.level4SocProbabilityOfGrowth*100) > 70){
					employeesLikelyToGrow = socElement.employmentTotal;
				}

				return {
					employeesLikelyToGrow,
					employmentTotal: socElement.employmentTotal,
					employeesUnlikelyToGrow,
					socCode: socElement.level4SocCode
				};
			});
			
			// Don't allow empty groups to be processed
			if(socGroup.length === 0) return;

			// Work out how many total employees there are within each SOC code/group
			const totalSocCodeEmployees = socGroupEmployeesBreakdown.map((obj) => {
				return obj.employmentTotal;
			}).reduce((accumulator, currentValue) => {
				return accumulator + currentValue;
			});

			// Store a reference to the employee total for the current SOC code, as a CSV will be generated later with this value
			if(!options.socEmployeeTotals[country].hasOwnProperty('soc-level-' + socLevel)){
				options.socEmployeeTotals[country]['soc-level-' + socLevel] = [];
			}

			options.socEmployeeTotals[country]['soc-level-' + socLevel].push({
				'socCode': socElement[filterType],
				'employeeTotal': totalSocCodeEmployees
			});

			// Work out how many employees within a group are likely to be in jobs which will grow and shrink?
			const likelyToGrowEmployees = socGroupEmployeesBreakdown.map((obj) => {
				const employmentFigureForLikelyToGrow = obj.employeesLikelyToGrow > 0 ? obj.employeesLikelyToGrow : 0;
				return employmentFigureForLikelyToGrow;
			}).reduce((accumulator, currentValue) => {
				return accumulator + currentValue;
			});

			const likelyToShrinkEmployees = socGroupEmployeesBreakdown.map((obj) => {
				const employmentFigureForUnlikelyToGrow = obj.employeesUnlikelyToGrow > 0 ? obj.employeesUnlikelyToGrow : 0;
				return employmentFigureForUnlikelyToGrow;
			}).reduce((accumulator, currentValue) => {
				return accumulator + currentValue;
			});

			const likelyToGrowEmployeesPercentage = likelyToGrowEmployees/totalSocCodeEmployees * 100;
			const likelyToShrinkEmployeesPercentage = (likelyToShrinkEmployees/totalSocCodeEmployees) * 100;

			// Store a reference to the probabilities (or grow vs. shrink) for the current SOC code, as a CSV will be generated later with this value
			if(!options.socProbabilities[country].hasOwnProperty('soc-level-' + socLevel)){
				options.socProbabilities[country]['soc-level-' + socLevel] = [];
			}

			options.socProbabilities[country]['soc-level-' + socLevel].push({
				'socCode': socElement[filterType],
				'employeeTotal': totalSocCodeEmployees,
				'growthEmployees': likelyToGrowEmployees,
				'growthEmployeePercentage': likelyToGrowEmployeesPercentage,
				'uncertainEmployees': totalSocCodeEmployees - likelyToGrowEmployees - likelyToShrinkEmployees,
				'uncertainEmployeePercentage': 100 - likelyToGrowEmployeesPercentage - likelyToShrinkEmployeesPercentage,
				'shrinkEmployees': likelyToShrinkEmployees,
				'shrinkEmployeePercentage': likelyToShrinkEmployeesPercentage,
				'socTitle': socElement.title
			});
		});

		// Generate a CSV file (to store employee totals) based on the data provided for a given SOC code level
		employeeTotalsCSV(socLevel, country);

		// Generate a CSV file (to store individual SOC code probabilities (growth vs. shrink) based on the data provided for a given SOC code level
		probabilityTotalsCSV(socLevel, country);

		// Should any /dist JSON files be generated?
		if(generateJSONForWeb && socLevel === 4){
			generateJSONFilesForWeb(country);
		}
	});
}

/**
 * Generate a CSV file (to store employee totals) based on the data provided for a given SOC code level
 * @function employeeTotalsCSV
 * @param {number} socLevel - The SOC level that the employment totals is relevant for
 * @param {string} country - Either 'uk' || 'us'
 */
const employeeTotalsCSV = (socLevel, country) => {
	const destinationFolder = './' + country + '/csv/employment-totals/';
	const destinationFileName = 'soc-level-' + socLevel + '.csv';
	const csv = json2csv({data: options.socEmployeeTotals[country]['soc-level-' + socLevel], fields: options.fields.employeeTotals});
	const path = './' + destinationFolder + destinationFileName;

	fs.writeFileSync(path, csv);

	console.log('**** Employee totals CSV file generated for ' + country.toUpperCase() + ' SOC level ' + socLevel + ' ****');
}

/**
 * Generate a CSV file (to store individual SOC code probabilities (growth vs. shrink) based on the data provided for a given SOC code level
 * @function probabilityTotalsCSV
 * @param {number} socLevel - The SOC level that the SOC code probabilities are relevant for
 * @param {string} country - Either 'uk' || 'us'
 */
const probabilityTotalsCSV = (socLevel, country) => {
	const destinationFolder = './' + country + '/csv/soc-probabilities/';
	const destinationFileName = 'soc-level-' + socLevel + '.csv';
	const csv = json2csv({data: options.socProbabilities[country]['soc-level-' + socLevel], fields: options.fields.probabilityTotals});
	const path = './' + destinationFolder + destinationFileName;

	fs.writeFileSync(path, csv);

	console.log('**** Probability totals CSV file generated for ' + country.toUpperCase() + ' SOC level ' + socLevel + ' ****');
}

/**
 * Generate JSON files for /dist directory of the website, to be used by the UI
 * @function generateJSONFilesForWeb
 * @private
 * @param {string} country - Either 'uk' || 'us'
 */
const generateJSONFilesForWeb = (country) => {
	// Write the probability breakdown file out to JSON (in addition to the previously generated CSV file)
	fs.writeFileSync(options.paths.output[country] + 'soc4-probability-breakdown.json', JSON.stringify(options.socProbabilities[country]['soc-level-4'], null, 4));

	// Copy the probability percentages JSON file from dev to dist (for the requested country)
	var data = fs.readFileSync('./' + country + '/soc4-probability-percentages.json', 'utf-8');
	fs.writeFileSync(options.paths.output[country] + 'soc4-probability-percentages.json', data);
}

/**
 * What are the total number of employees in the origin datasheet (for ALL of the UK, ALL sectors, ALL SOC4 codes)
 * @function retrieveAllCountryEmployeesTotal
 * @returns {number} - The total number of employees for the entire dataset
 */
const retrieveAllCountryEmployeesTotal = (country) => {
	return options.paths.input[country].level4SocCodes.map((employmentObj) => {
		return parseInt(employmentObj.Employment);
	}).reduce((accumulator, currentValue) => {
		return accumulator + currentValue;
	});
}

/**
 * Retrieve all SOC codes (for a specific level) in order to manipulate
 * @function retrieveAllSocTitles
 * @param {number} socLevel - 1, 2, 3 or 4
 * @param {string} country - Either 'uk' || 'us'
 */
const retrieveAllSocTitles = (socLevel, country) => {
	return new Promise(function(resolve, reject){
		try {
			const socCodesFull = options.paths.input[country].soc4CodeTitles;
			let filterType;

			switch(socLevel){
				case 1: 
					filterType = 'Major Group';
					break;
				case 2: 
					filterType = 'Sub-Major Group';
					break;
				case 3: 
					filterType = 'Minor Group';
					break;
				case 4: 
					filterType = 'Unit Group';
					break;
			}

			const socCodesFiltered = socCodesFull.filter((socElement) => {
				return socElement[filterType] !== null;
			}).map((socElement) => {
				const obj = {};
				
				obj[filterType] = socElement[filterType];
				obj['title'] = socElement['Group Title'];

				return obj;
			});

			// Return the re-formatted data as part of the promise
			resolve(socCodesFiltered);
			
		} catch(err){
			reject(err);
		}
	});
}

/**
 * Format a number in the format of xx,xxx,xxx
 * @function formatNumberWidthCommas
 * @param {number} - The number to format
 * @returns {string} - The formatted number
 */
const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Cleanup previous output directories
rimraf.sync('./uk/csv');
rimraf.sync('./us/csv');

// Create new output directories
fs.mkdirSync('./uk/csv');
fs.mkdirSync('./uk/csv/employment-totals');
fs.mkdirSync('./uk/csv/soc-probabilities');
fs.mkdirSync('./us/csv');
fs.mkdirSync('./us/csv/employment-totals');
fs.mkdirSync('./us/csv/soc-probabilities');

const allUKEmployees = retrieveAllCountryEmployeesTotal('uk');
console.log('**** Total number of employees in the UK: ' + formatNumberWithCommas(allUKEmployees) + ' ****');

const allUSEmployees = retrieveAllCountryEmployeesTotal('us');
console.log('**** Total number of employees in the US: ' + formatNumberWithCommas(allUSEmployees) + ' ****');

// Generate all data files (for non-web consumption) - UK specific
generateProbabilityStatsForGroup(1, 'uk');
generateProbabilityStatsForGroup(2, 'uk');
generateProbabilityStatsForGroup(3, 'uk');
generateProbabilityStatsForGroup(4, 'uk', true);

// Generate all data files (for non-web consumption) - US specific
generateProbabilityStatsForGroup(1, 'us');
generateProbabilityStatsForGroup(2, 'us');
generateProbabilityStatsForGroup(3, 'us');
generateProbabilityStatsForGroup(4, 'us', true);