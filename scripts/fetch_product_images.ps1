$ErrorActionPreference = 'Stop'
$out = 'E:\Personal Projects\ecommerce-production\scripts\product_images.json'

$terms = @(
  @('wood-pressed-groundnut-oil','groundnut oil'),
  @('wood-pressed-sesame-oil','sesame oil'),
  @('wood-pressed-coconut-oil','coconut oil'),
  @('castor-oil','castor oil bottle'),
  @('kodo-millet-noodles','millet noodles'),
  @('little-millet-noodles','little millet noodles'),
  @('barnyard-millet-noodles','barnyard millet noodles'),
  @('foxtail-millet-noodles','foxtail millet noodles'),
  @('finger-millet-noodles','finger millet noodles'),
  @('karupu-kavuni-rice-noodles','black rice noodles'),
  @('kodo-millet-vermicelli','millet vermicelli'),
  @('little-millet-vermicelli','little millet vermicelli'),
  @('barnyard-millet-vermicelli','barnyard millet vermicelli'),
  @('foxtail-millet-vermicelli','foxtail millet vermicelli'),
  @('pearl-millet-vermicelli','pearl millet vermicelli'),
  @('sugarcane-jaggery-powder','jaggery powder'),
  @('sugarcane-jaggery-round','jaggery'),
  @('palm-jaggery-round','palm jaggery'),
  @('palm-jaggery-crystal','palm sugar'),
  @('natural-wild-honey','honey jar'),
  @('himalayan-powder-salt','himalayan salt'),
  @('himalayan-crystal-salt','rock salt crystals'),
  @('kodo-millet-semi-polished','kodo millet'),
  @('little-millet-semi-polished','little millet'),
  @('barnyard-millet-semi-polished','barnyard millet'),
  @('foxtail-millet-semi-polished','foxtail millet'),
  @('browntop-millet-semi-polished','browntop millet'),
  @('native-pearl-millet','pearl millet grain'),
  @('native-finger-millet','finger millet'),
  @('white-sorghum','sorghum grain'),
  @('thooyamalli-semi-polished-boiled','samba rice'),
  @('thooyamalli-fully-polished-boiled','rice grain'),
  @('athur-kichili-samba-semi-polished-boiled','kichili samba rice'),
  @('thanga-samba-semi-polished-boiled','samba rice grain'),
  @('seeraga-samba-fully-polished-boiled','seeraga samba rice'),
  @('karupu-kavuni-rice-boiled','black rice grain'),
  @('mappillai-samba-rice-boiled','mappillai samba rice'),
  @('kerala-matta-rice-boiled','kerala matta rice'),
  @('kattuyanam-rice-boiled','red rice grain'),
  @('rathasali-rice-boiled','brown rice grain'),
  @('poongar-rice-boiled','rice varieties'),
  @('ponmani-idly-rice-boiled','idli rice'),
  @('wheat-flour','wheat flour'),
  @('finger-millet-flour','ragi flour'),
  @('mappillai-samba-flakes','rice flakes'),
  @('wheat-flakes','wheat flakes'),
  @('finger-millet-flakes','ragi flakes'),
  @('pearl-millet-flakes','millet flakes'),
  @('white-sorghum-flakes','sorghum flakes'),
  @('native-sirumani-groundnut','groundnut seeds'),
  @('moth-gram','moth bean'),
  @('green-gram','green gram'),
  @('white-horse-gram','horse gram'),
  @('black-horse-gram','urad beans'),
  @('white-urad-dal','urad dal'),
  @('black-urad-dal','black lentils'),
  @('toor-dal','toor dal'),
  @('mud-packed-toor-dal','pigeon pea seeds'),
  @('moong-dal','moong dal'),
  @('baloon-vine-biscuits','biscuits'),
  @('aavarampoo-biscuits','sweet biscuits'),
  @('hibiscus-biscuits','cookies'),
  @('thuthuvalai-biscuits','butter cookies'),
  @('pirandai-biscuits','digestive biscuits'),
  @('pearl-millet-biscuits','millet biscuits'),
  @('sorghum-millet-biscuits','sorghum biscuits'),
  @('finger-millet-biscuits','cereal biscuits'),
  @('multi-grain-biscuits','oatmeal cookies'),
  @('black-kavuni-rice-biscuits','chocolate cookies'),
  @('koda-millet-biscuits','whole grain cookies'),
  @('foxtail-millet-biscuits','biscuit snack'),
  @('little-millet-biscuits','shortbread biscuits'),
  @('barnyard-millet-biscuits','cracker biscuits'),
  @('groundnut-balls','peanut snack'),

  @('sesame-balls','sesame snack'),
  @('groundnut-chikki','peanut chikki'),
  @('black-sesame-chikki','sesame candy'),
  @('groundnut-coco-mittai','peanut candy'),
  @('millet-sweet-chikki','sweet snack'),
  @('fried-rice-balls','rice puffs'),
  @('ginger-candy','ginger candy'),
  @('coconut-burfi','coconut sweet'),
  @('sesame-seedai','murukku'),
  @('achu-murukku','murukku snack'),
  @('fried-native-sirumani-groundnut','roasted peanuts')
)

function Get-SearchUrls([string]$term) {
  $enc = [uri]::EscapeDataString($term)
  $url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=$enc&prop=imageinfo&iiprop=url&iiurlwidth=600&origin=*"
  for ($try = 0; $try -lt 5; $try++) {
    try {
      $r = Invoke-RestMethod -Uri $url -TimeoutSec 30
      break
    } catch {
      Start-Sleep -Seconds 6
    }
  }
  if (-not $r) { return @() }
  $results = @()
  foreach ($prop in $r.query.pages.PSObject.Properties) {
    $p = $prop.Value
    $title = $p.title -as [string]
    $ii = $p.imageinfo[0]
    if ($null -eq $ii) { continue }
    if ($title -match '\.(svg|tif|tiff|webm|ogg|ogv|pdf)$') { continue }
    if ($title -match 'Map|Diagram|Logo|Icon|Flag|Stamp|Drawing|Chart') { continue }
    $thumb = $ii.thumburl -as [string]
    if (-not $thumb) { continue }
    $clean = ($thumb -split '\?')[0]
    $results += @{ title = $title; url = $clean }
  }
  return $results
}

$map = @{}
$used = @{}
foreach ($t in $terms) {
  $slug = $t[0]
  $term = $t[1]
  $cat = ($slug -split '-')[0]
  $spot = $null
  for ($attempt = 0; $attempt -lt 3 -and -not $spot; $attempt++) {
    if ($attempt -gt 0) { $term = "$term food" }
    $results = @(Get-SearchUrls -term $term)
    Start-Sleep -Milliseconds 1500
    if ($results.Count -eq 0) { continue }
    $tokens = $term.ToLower().Split(' ') | Where-Object { $_.Length -gt 2 }
    $ranked = $results | ForEach-Object {
      $t = $_.title.ToLower()
      $score = @($tokens | Where-Object { $t -match [regex]::Escape($_) }).Count
      $_.title = $t
      [pscustomobject]@{ score = $score; url = $_.url }
    } | Sort-Object -Property score -Descending
    $candidate = $ranked | Where-Object { -not $used.ContainsKey($_.url) } | Select-Object -First 1
    if (-not $candidate) { $candidate = $ranked[0] }
    if ($candidate.url) { $spot = $candidate }
  }
  if (-not $spot) { $spot = @{ url = '' } }
  $map[$slug] = $spot.url
  if ($spot.url) { $used[$spot.url] = $true }
  Write-Output ("{0} <- {1} :: {2}" -f $slug, $term, $spot.url)
}

$map | ConvertTo-Json | Set-Content -LiteralPath $out -Encoding UTF8
Write-Output "saved $($map.Count) entries to $out"
