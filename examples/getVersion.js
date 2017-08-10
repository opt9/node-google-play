var fs = require('fs');

var api = require('./common-api-init');

var pkg = 'com.coupang.mobile';


function downloadToFile (pkg) {
	return api.details(pkg).then(function (res) {
		var vc = res.details.appDetails.versionCode;
		var vs = res.details.appDetails.versionString;
		return { versionCode : vc, versionString : vs };
	})
	.then(function (version) {
		var vc = version.versionCode;
		var tvs= version.versionString;
		var vs = tvs.replace(/\./g, "-");
		var oldFile = '/pang/service/qarkweb/tmp/Coupang_' + vs + '.apk';
		var newFile = oldFile.replace(/tmp/, "uploads")

		var fStream = fs.createWriteStream(oldFile);
		return api.download(pkg, vc).then(function (res) {
			res.pipe(fStream);
			// move to security check directory
			res.on('end', function() {
				var source = fs.createReadStream(oldFile);
				var dest = fs.createWriteStream(newFile);
				source.pipe(dest);
				source.on('error', function(err) { console.log('File move failed!'); });
			});
			res.on('error', function(err) {	console.log('APK file download failed!'); });
		});
	});
}


function checkNewVersion (pkg) {
	return api.details(pkg).then(function (res) {
		var vc = res.details.appDetails.versionCode;
		var vs = res.details.appDetails.versionString;
		var version = fs.readFileSync('version.txt').toString();
		// console.log(version);
		if (version == vs.toString()) {
			console.log("Same");
		} else {
			console.log("New");
			fs.writeFileSync('version.txt', vs.toString());
			downloadToFile(pkg);
		}
	});
}

checkNewVersion(pkg);
