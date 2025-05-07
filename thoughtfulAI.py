def sort(width, height, length, mass):
  '''
  length unit is CM
  mass unit is KG
  '''
  assert width > 0
  assert height > 0
  assert length > 0
  assert mass > 0

  bulky = width >= 150 or height >= 150 or length >= 150 or width * height * length >= 1_000_000
  heavy = mass >= 20

  if not bulky and not heavy:
    return 'STANDARD'
  elif bulky and heavy:
    return 'REJECTED'
  else:
    return 'SPECIAL'

testCases = [
  ( ( 10, 10, 10, 9.0 ), 'STANDARD' ),
  ( ( 10, 150, 10, 9.0 ), 'SPECIAL' ),
  ( ( 1000, 150, 1000, 9.0 ), 'SPECIAL' ),
  ( ( 10, 1, 10, 90 ), 'SPECIAL' ),
  ( ( 1000, 1000, 1000, 90 ), 'REJECTED' ),
  ( ( 10, 10, 150, 20 ), 'REJECTED' ),
  ( ( 10, 10, 15, 2 ), 'REJECTED' ),
]

print('Starting tests...')

for index, tc in enumerate(testCases):
  assert sort(tc[0][0], tc[0][1], tc[0][2], tc[0][3] ) == tc[1]
  print('#', index, 'passed')

print('All tests passed')
