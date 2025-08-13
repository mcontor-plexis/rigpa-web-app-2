# PowerShell script to convert tab-separated data to TypeScript with proper UTF-8 handling
$inputFile = "Tibetan _Table_React1.ts"

# Read all lines with UTF-8 encoding, skip header
$lines = Get-Content $inputFile -Encoding UTF8 | Select-Object -Skip 1

$tsContent = "import { DzogchenTerm } from './DzogchenTermsData';`n`n"
$tsContent += "// Additional 228 Dzogchen terms imported from Tibetan _Table_React1.ts`n"
$tsContent += "export const additionalTerms: Omit<DzogchenTerm, 'id'>[] = [`n"

foreach ($line in $lines) {
    if ($line.Trim() -ne "") {
        $fields = $line -split "`t"
        if ($fields.Length -ge 4) {
            # Escape quotes and backslashes properly
            $tibetan = $fields[0].Trim() -replace "\\", "\\\\" -replace "'", "\'" -replace "`"", "\`""
            $wiley = $fields[1].Trim() -replace "\\", "\\\\" -replace "'", "\'" -replace "`"", "\`""
            $transliteration = $fields[2].Trim() -replace "\\", "\\\\" -replace "'", "\'" -replace "`"", "\`""
            $translation = $fields[3].Trim() -replace "\\", "\\\\" -replace "'", "\'" -replace "`"", "\`""
            
            $tsContent += "  { tibetanScript: '$tibetan', wileyScript: '$wiley', englishTransliteration: '$transliteration', englishTranslation: '$translation' },`n"
        }
    }
}

$tsContent += "];`n"

# Write to output file with UTF-8 encoding
$tsContent | Out-File -FilePath "AdditionalDzogchenTerms.ts" -Encoding UTF8 -NoNewline
