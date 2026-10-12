"""Verify every pre-optimization web URL against final APK contents and report real APK bytes."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile


def verify_apk(apk, report):
    with ZipFile(apk) as archive:
        aliases = json.loads(archive.read('assets/liga-asset-aliases.json'))
        if aliases != report['aliases']:
            raise ValueError('Packaged Android aliases differ from verified asset inventory')
        for name, original in report['inventory'].items():
            target = aliases.get(name, name)
            if target in aliases:
                raise ValueError('Chained Android asset alias: ' + name)
            if Path(name).suffix.lower() != Path(target).suffix.lower():
                raise ValueError('Android alias MIME mismatch: ' + name)
            try:
                data = archive.read('assets/public/' + target)
            except KeyError as error:
                raise ValueError('Missing Android asset: ' + name) from error
            if len(data) != original['bytes'] or hashlib.sha256(data).hexdigest() != original['sha256']:
                raise ValueError('Changed Android asset: ' + name)
        # APK entry bytes are compared, rather than just comparing pre-Gradle disk files.
        for name in aliases:
            if 'assets/public/' + name in archive.namelist():
                raise ValueError('Redundant Android image unexpectedly remained in APK: ' + name)
        if not any(name.startswith('classes') and name.endswith('.dex') for name in archive.namelist()):
            raise ValueError('APK has no compiled native code')
        return sum(entry.file_size for entry in archive.infolist() if entry.filename.startswith('assets/public/'))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apk', required=True)
    parser.add_argument('--baseline', required=True)
    parser.add_argument('--report', default='android-asset-report.json')
    args = parser.parse_args()
    report_path = Path(args.report)
    report = json.loads(report_path.read_text())
    report['verifiedApkPublicBytes'] = verify_apk(args.apk, report)
    report['baselineApkBytes'] = Path(args.baseline).stat().st_size
    report['optimizedApkBytes'] = Path(args.apk).stat().st_size
    report['savedApkBytes'] = report['baselineApkBytes'] - report['optimizedApkBytes']
    if report['savedApkBytes'] <= 0:
        raise ValueError('Android APK optimization did not reduce actual APK bytes')
    with ZipFile(args.baseline) as baseline:
        report['removedBaselineCompressedBytes'] = sum(
            baseline.getinfo('assets/public/' + name).compress_size
            for name in report['aliases']
        )
    # Adding the alias map, its Java implementation and signing metadata has a
    # small cost. Do not accept a correctly indexed APK retaining deleted payload
    # space: Zipflinger fills holes with unnamed virtual ZIP entries in incremental
    # builds, so an inventory check alone cannot prove a smaller download.
    native_overhead_budget = max(256_000, report['removedBaselineCompressedBytes'] // 20)
    report['minimumExpectedApkSavings'] = max(0, report['removedBaselineCompressedBytes'] - native_overhead_budget)
    if report['savedApkBytes'] < report['minimumExpectedApkSavings']:
        raise ValueError(
            'APK retained incremental ZIP padding: actual reduction '
            + str(report['savedApkBytes']) + ' bytes; removed packaged image data '
            + str(report['removedBaselineCompressedBytes'])
            + ' bytes. Build the optimized APK with Gradle clean assembleDebug.'
        )
    report_path.write_text(json.dumps(report, indent=2) + '\n')
    lines = [
        '| Android size measurement | Bytes | MB (decimal) |',
        '| --- | ---: | ---: |',
    ]
    for label, key in [('APK before', 'baselineApkBytes'), ('APK after', 'optimizedApkBytes'), ('APK reduction', 'savedApkBytes'), ('Web assets before', 'beforeBytes'), ('Web assets after (including aliases)', 'afterAssetBytes')]:
        lines.append(f'| {label} | {report[key]:,} | {report[key] / 1_000_000:.2f} |')
    lines.append(f'\nVerified identical original bytes for all {report["originalFileCount"]} web URLs; removed {report["removedFileCount"]} redundant image copies. Original media, scripts, CSS, video files and request handling remain intact.')
    summary = '\n'.join(lines) + '\n'
    print(summary)
    import os
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as output:
            output.write(summary)


if __name__ == '__main__':
    main()
