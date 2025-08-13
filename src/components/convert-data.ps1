# PowerShell script to convert tab-separated data to TypeScript
$inputFile = "Tibetan _Table_React1.ts"
$outputFile = "AdditionalDzogchenTerms.ts"

# Read all lines except the header
$lines = Get-Content $inputFile | Select-Object -Skip 1

$tsContent = @"
import { DzogchenTerm } from './DzogchenTermsData';

// Additional 228 Dzogchen terms imported from Tibetan _Table_React1.ts
export const additionalTerms: Omit<DzogchenTerm, 'id'>[] = [
"@

foreach ($line in $lines) {
    $fields = $line -split "`t"
    if ($fields.Length -ge 4) {
        $tibetan = $fields[0] -replace "'", "\'" -replace '"', '\"'
        $wiley = $fields[1] -replace "'", "\'" -replace '"', '\"'
        $transliteration = $fields[2] -replace "'", "\'" -replace '"', '\"'
        $translation = $fields[3] -replace "'", "\'" -replace '"', '\"'
        
        $tsContent += "  { tibetanScript: '$tibetan', wileyScript: '$wiley', englishTransliteration: '$transliteration', englishTranslation: '$translation' },`n"
    }
}

$tsContent += "];"

# Write to output file
$tsContent | Out-File -FilePath $outputFile -Encoding UTF8
