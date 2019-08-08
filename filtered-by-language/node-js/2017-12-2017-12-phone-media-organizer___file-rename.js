// Import NPM scripts
const ffmpeg = require('fluent-ffmpeg'); // For screenshots from videos
const fs = require('fs-extra');
const handlebars = require('handlebars');
const imageSize = require('image-size');
const moment = require('moment');
const path = require('path');
const sharp = require('sharp');

const mediaOrganizer = (function(){
	const options = {
		directories: {
			images: {
				destinationPath: path.join(__dirname, '../dist/assets/images/fullset/'),
				sourcePath: path.join(__dirname, './assets/images/fullset/')
			},
			movies: {
				destinationPath: path.join(__dirname, '../dist/assets/movies/fullset/'),
				sourcePath: path.join(__dirname, './assets/movies/fullset/')
			}
		},
		excludedFileTypes: [
			'DS_Store',
			'tmp',
			'tnl'
		],
		filesToSort: {},
		handlebarHelpers: {
			formatDate: function(dateToConvert){
				return moment(dateToConvert).format('dddd MMMM Do YYYY, h:mm:ss a');	
			},
			formatThumbnailFileNameForMediaType: function(filename, fileType){
				let updatedThumbnailName = filename;
				const filenameNoExtension = filename.slice(0, -4);

				if(fileType === 'movies'){
					return filename.slice(0, -4) + '.jpg';
				}

				return filename;
			},
			toUpperCase: function(str){
				return str.toUpperCase();
			}
		},
		handlebarsTemplateFile: './html/template.html',
		yearsToSort: [2016, 2017]
	}

	/**
	 * Re-order all src directory files (images/movies) along with making a copy of all files, ordered correctly in a new file system directory
	 * @function processFiles
	 * @private
	 * @param {string} fileType - Either 'images' or 'movies'
	 */
	const processFiles = (fileType) => {
		readDirectory(options.directories[fileType].sourcePath).then((files) => {
			// Remove any pre-determined exclusion files AS WELL AS any sub-directories
			cleanInputFiles(files, fileType).then((processedFiles) => {
				// If there are no files to process, exit
				if(processedFiles.length > 0){
					// There are new files to process
					removeTempDirectory(options.directories[fileType].destinationPath).then(() => {
						// Read a directory to return a list of files it contains
						readDirectory(options.directories[fileType].sourcePath).then((files) => {
							// Sort the processed files by date (oldest first)
							cleanInputFiles(files, fileType).then((processedFiles) => {
								// Re-map the structure of the files into separate years
								options.yearsToSort.forEach((year) => {
									options.filesToSort[year] = processedFiles.filter((processedFile) => {
										return processedFile.yearCreated === year;
									});

									// Before ordering any files, make sure files are stored in a directory named as the year they were created
									copyFilesToDevYearTakenFolder(year.toString(), fileType);

									// Order the files by date taken (oldest first)
									const filesOrderedByDate = sortArrayByObjectProperty(options.filesToSort[year], 'dateCreated');

									// Copy each file in its re-ordered positioning (at full-resolution) and then generate a thumbnail for each
									copyReorderedFiles(filesOrderedByDate, fileType, year.toString());

									// Generate a HTML file from a template (handlebars) file, listing the files
									generateHTMLSummary(filesOrderedByDate, fileType, year);
								});
							});
						});
					});
				}
			});
		});
	}

	/**
	 * Read a directory to return a list of files it contains
	 * @function readDirectory
	 * @param {String} srcDirectory - The directory to find the files for
	 * @returns An array containing the files in the requested directory on the file system
	 */
	const readDirectory = (srcDirectory) => {
		return new Promise((resolve, reject) => {
			fs.readdir(srcDirectory, (err, response) => {
				if(err){
					reject(err);
				} else {
					resolve(response);
				}
			});
		});
	}

	/**
	 * Tidy up the files list so that specific files are removed, and directories are also not stored
	 * @function cleanInputFiles
	 * @private
	 * @param {array} files - The list of files from the specified file system directory
	 * @param {string} fileType - Either 'images' or 'movies'
	 * @returns {array} - An array of promises, with the data of each file (EXIF data)
	 */
	const cleanInputFiles = (files, fileType) => {
		const filesToProcess = files.filter((fileName) => {
			return options.excludedFileTypes.indexOf(retrieveFileExtension(fileName)) === -1;
		}).map((file) => {
			// Only store a reference to files and not directories
			const fsPath = path.join(options.directories[fileType].sourcePath, file);
			if(!fs.statSync(fsPath).isDirectory()){
				let fileData = {
					filename: file
				}

				if(fileType === 'images'){
					const sizeOf = imageSize(options.directories[fileType].sourcePath + file);
					const imageHeight = sizeOf.height;
					const imageWidth = sizeOf.width;
					const orientation = imageHeight > imageWidth ? 'portrait' : 'landscape';						

					fileData.height = imageHeight;
					fileData.orientation = orientation;
					fileData.width = imageWidth;
				}

				return fileData;
			} else {
				return null;
			}
		}).filter((file) => {
			return file !== null;
		});

		const filesExifDataPromises = filesToProcess.map((file) => {
			return fileDataFn(file, fileType);
		});

		return Promise.all(filesExifDataPromises);
	}

	/**
	 * Before ordering any files, make sure files are stored in a directory named as the year they were created (within dev NOT dist)
	 * @function copyFilesToDevYearTakenFolder
	 * @private
	 * @param {string} year - Eg: '2017'
	 * @param {string} fileType - Either 'images' or 'movies'
	 */
	const copyFilesToDevYearTakenFolder = (year, fileType) => {
		if(!fs.existsSync(path.join(options.directories[fileType].sourcePath, year))){
			fs.ensureDirSync(path.join(options.directories[fileType].sourcePath, year));
		}

		options.filesToSort[year].forEach(function(image, index){
			fs.moveSync(image.path, path.join(options.directories[fileType].sourcePath, year, image.filename));
		});
	}

	/**
	 * Copy each file into its re-ordered positioning (at full-resolution) and then generate a thumbnail for each
	 * @function copyReorderedFiles
	 * @private
	 * @param {array} arr - The list of images in their re-ordered positioning
	 * @param {string} fileType - Either 'images' or 'movies'
	 * @param {string} year - The year the images were taken
	 */
	const copyReorderedFiles = (arr, fileType, year) => {
		const destinationPath = path.join(options.directories[fileType].destinationPath, year);
		const destinationThumbnailsPath = path.join(options.directories[fileType].destinationPath, year, 'thumbnails');

		// Before creating the HTML file, create directories to store the destination and thumbnail images inside
		if(!fs.existsSync(destinationPath)){
			fs.ensureDirSync(destinationPath)
		}

		if(!fs.existsSync(destinationThumbnailsPath)){
			fs.ensureDirSync(destinationThumbnailsPath)
		}

		arr.forEach(function(file, index){
			fs.copy(path.join(options.directories[fileType].sourcePath, year, file.previousFilename), path.join(destinationPath, file.filename)).then(() => {
				console.log('File copied from ' + path.join(options.directories[fileType].sourcePath, year, file.previousFilename) + ' to ' + path.join(destinationPath, file.filename));

				switch(fileType){
					case 'images':
						// What dimensions should the thumbnail be generated at?
						const thumbnailDimensions = getThumbnailDimensions(file.height, file.width);

						// Resize the original and save it to the dist folder, so that it can be served over HTTP
						sharp(path.join(destinationPath, file.filename))
							.resize(thumbnailDimensions.width, thumbnailDimensions.height)
							.toFormat('jpeg')
							.toFile(path.join(destinationThumbnailsPath, file.filename))

						break;
					case 'movies':
						ffmpeg.ffprobe(path.join(options.directories[fileType].sourcePath, year, file.previousFilename), function(err, metadata){
							let videoHeight = 200;
							let videoWidth = 200;
							let hasStream0Height = metadata.streams[0].hasOwnProperty('height');
							let hasStream0Width = metadata.streams[0].hasOwnProperty('width');
							let hasStream1Height = metadata.streams[1].hasOwnProperty('height');
							let hasStream1Width = metadata.streams[1].hasOwnProperty('width');
							
							if(hasStream0Height && hasStream0Width){
								videoHeight = metadata.streams[0].height;
								videoWidth = metadata.streams[0].width;

								// Handle issue with landscape videos being processed as portrait
								let hasOrientationMetadata = metadata.streams[0].hasOwnProperty('rotation');
								if(hasOrientationMetadata && metadata.streams[0].rotation === '-90'){
									videoHeight = metadata.streams[0].width;
									videoWidth = metadata.streams[0].height;
								}
							} else if(hasStream1Height && hasStream1Width){
								videoHeight = metadata.streams[1].height;
								videoWidth = metadata.streams[1].width;
							}

							const thumbnailDimensions = getThumbnailDimensions(videoHeight, videoWidth);

							// Generate a thumbnail for a provided movie path
							generateVideoScreenshot(path.join(options.directories[fileType].sourcePath, year, file.previousFilename), destinationThumbnailsPath, file.filename.slice(0, -4), thumbnailDimensions.height, thumbnailDimensions.width);
						});

						break;
				}
			});
		});
	}

	/**
	 * Generate a thumbnail for a provided movie path
	 * @function generateVideoScreenshot
	 * @private
	 * @param {string} movieFilePath - The full path (and filename) of the movie file
	 * @param {string} movieThumbnailPath - The full path of where thumbnails should be saved
	 * @param {string} movieFileName - The filename of the movie. This will be used for the name of the thumbnail being generated
	 * @param {number} movieHeight - The height of the movie canvas
	 * @param {number} movieWidth - The width of the movie canvas
	 */
	const generateVideoScreenshot = (movieFilePath, movieThumbnailPath, movieFileName, movieHeight, movieWidth) => {
		ffmpeg(movieFilePath)
			.screenshots({
				count: 1,
				filename: movieFileName + '.jpg',
				folder: movieThumbnailPath,
				size: movieWidth + 'x' + movieHeight
			});
	}

	/**
	 * What dimensions should the thumbnail be generated at?
	 * @function getThumbnailDimensions
	 * @private
	 * @param {number} height - The original height of the image
	 * @param {number} width - The original height of the image
	 * @returns {object} object.height - The height the thumbnail should be generated at
	 * 			{object} object.width - The width the thumbnail should be generated at
	 */
	const getThumbnailDimensions = (height, width) => {
		// Should the thumbnail be portrait or landscape?
		let thumbnailWidth;
		let thumbnailHeight;
		const orientation = height > width ? 'portrait' : 'landscape';

		switch(orientation){
			case 'portrait': 
				thumbnailHeight = 200;
				thumbnailWidth = parseInt(200 * (width / height));
				break;
			case 'landscape':
				thumbnailHeight = parseInt(200 * (height / width));
				thumbnailWidth = 200;
				break;
		}

		return {
			height: thumbnailHeight,
			width: thumbnailWidth
		}
	}

	/**
	 * Retrieve the file extension from a full fileName
	 * @function retrieveFileExtension
	 * @param {string} fileName - The filename to retrieve the extension for
	 * @returns {string} - The 3 digit file extension (eg: 'jpg')
	 */
	const retrieveFileExtension = (fileName) => {
		return fileName.split('.').pop();
	}

	/**
	 * Depending on how many files are being processed, a certain number of zeros will be needed as a prefix for naming conventions to be maintained
	 * @function prefixFileNamdWithLeadingZeros
	 * @returns {string} - The filename with the appropriate number of prefixed zeros (eg: 001.jpg)
	 */
	const prefixFileNameWithLeadingZeros = (maxFileNameLength, fileName) => {
		const prefixRequired = maxFileNameLength - fileName.toString().length;
		let prefix = '';

		switch(prefixRequired){
			case 1: 
				prefix = '0';
				break;
			case 2: 
				prefix = '00';
				break;
		}

		if(fileName.toString().length === 1){
			prefix = '00';
		}

		return prefix + fileName;
	}

	/**
	 * Identify from the images data which year the file was created in
	 * @function yearCreated
	 * @private
	 * @param {date} dateTime - The date/timestamp of the file
	 * @returns {number} - The 4 digit code the file was generated in
	 */
	const yearCreated = (dateTime) => {
		return moment(dateTime).year();
	}

	/**
	 * Performed a promise to retrieve image Exif data
	 * @function fileDataFn
	 * @private
	 * @param {object} file - The actual file being accessed
	 * @param {string} fileType - Either 'images' || 'movies'
	 * @returns {promise} - The promise object containing the individuals image data
	 */
	const fileDataFn = (file, fileType) => {
		return new Promise((resolve, reject) => {
			let filePath = path.join(options.directories[fileType].sourcePath, file.filename);

			fs.stat(filePath, function (error, stats){
				if(!error){
					let fileData = {
						dateCreated: stats.birthtime,
						extension: retrieveFileExtension(file.filename).toLowerCase(),
						filename: file.filename,
						height: file.height,
						path: filePath,
						width: file.width,
						yearCreated: yearCreated(stats.birthtime)
					}

					if(fileType === 'images'){
						fileData.orientation = file.orientation;
					}

					resolve(fileData);
				}
			});
		});
	}

	/**
	 * Order the files by date taken (oldest first)
	 * @function sortArrayByObjectProperty
	 * @param {array} arr - The array to sort
	 * @param {string} property - The array property to sort against
	 * @returns {array} - The sorted array
	 */
	const sortArrayByObjectProperty = (arr, property) => {
		let reorderedArray = arr.sort(function(a, b){ 
			return a[property] - b[property];
		});

		// Rename the files to match their positioning in the newly reordered array
		// How many files are there in total to process?
		const filesToProcess = reorderedArray.length;
		const maxFileNameLength = filesToProcess.toString().length;
		let orderedFilename;
		let currentFilepath;

		reorderedArray.forEach(function(file, index){
			// Maintain the previous filename, for comparison purposes
			reorderedArray[index].previousFilename = file.filename;

			// Update the filename
			orderedFilename = prefixFileNameWithLeadingZeros(maxFileNameLength, index+1) + '.' + retrieveFileExtension(file.filename);
			reorderedArray[index].filename = orderedFilename.toLowerCase();

			// Update the filepath (incudign the new filename)
			currentFilepath = reorderedArray[index].path.substring(0, reorderedArray[index].path.lastIndexOf('/'));
			reorderedArray[index].path = currentFilepath + '/' + orderedFilename;
		});

		return reorderedArray;
	}

	/**
	 * Reverse an array, so the handlebars generated template shows most-recent images first (and oldest images last)
	 * @function reverseArray
	 * @private
	 * @param {array} arr - The array to reverse
	 * @returns {array} - The reversed array
	 */
	const reverseArray = (arr) => {
		return arr.reverse();
	}

	/**
	 * Remove the temporary directory which is used to store the re-ordered files
	 * @function removeTempDirectory
	 * @private
	 * @param {string} directoryPath - The directory path to remove from the file system
	 */
	const removeTempDirectory = (directoryPath) => {
		return new Promise((resolve, reject) => {
			fs.remove(directoryPath, (error) => {
				if(error){
					reject();
				}

				resolve();
			});
		});
	}

	/**
	 * Generate a HTML file from a template (handlebars) file, listing the files
	 * @function generateHTMLSummary
	 * @private
	 * @param {array} filesList - A list of files to include the details for within the output HTML file (generated by the template)
	 * @param {string} fileType - Either 'images' or 'movies'
	 * @param {string} year - The year the images were taken
	 */
	const generateHTMLSummary = (filesList, fileType, year) => {
		// Read the template file
		fs.readFile(options.handlebarsTemplateFile, 'utf-8', (error, source) => {
			// Custom helpers for template file
			handlebars.registerHelper(options.handlebarHelpers);

			const template = handlebars.compile(source);
			const data = {
				fileType: fileType,
				imageDirectoryName: 'fullset',
				list: reverseArray(filesList),
				year: year
			};

			const result = template(data);

			fs.writeFile('./../dist/' + fileType + '-' + year + '.html', result, function(error){
				if(error){
					return console.log(error);
				}

				console.log('Output HTML file (' + fileType + '-' + year + '.html generated successfully');
			});
		});
	}

	return {
		generateHTMLSummary,
		prefixFileNameWithLeadingZeros,
		processFiles,
		readDirectory,
		removeTempDirectory,
		retrieveFileExtension,
		sortArrayByObjectProperty,
		yearCreated
	}
}());

// Process images
mediaOrganizer.processFiles('images');

// Process movies
mediaOrganizer.processFiles('movies');
