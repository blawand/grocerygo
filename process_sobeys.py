import pandas as pd
import re

# List of common brand names for removal
common_brands = [
    'Compliments', 'Maple Lodge Farms', 'Maple Leaf Natural Selections', 
    'President\'s Choice', 'Kirkland Signature', 'Great Value', 'No Name',
    'Nature\'s Path', 'Dempster\'s', 'Wonder', 'Irresistibles', 'Farmer\'s Market',
    'Schneiders', 'Lactantia', 'Silk', 'Yoplait', 'Danone', 'Activia',
    'Philadelphia', 'Kraft', 'Heinz', 'Campbell\'s', 'Nestle', 'Oreo',
    'Quaker', 'Kellogg\'s', 'Post', 'General Mills', 'Barilla', 'Catelli',
    'Delverde', 'Ragu', 'Classico', 'Hunt\'s', 'Prego', 'Tostitos', 'Doritos',
    'Lay\'s', 'Ruffles', 'Pringles', 'Cheetos', 'Old Dutch', 'Planters',
    'Snyder\'s', 'Orville Redenbacher\'s', 'Smartfood', 'Act II', 'Boomchickapop',
    'Skippy', 'Jif', 'Kraft', 'Planters', 'Nutella', 'Smucker\'s', 'Welch\'s',
    'Sunkist', 'Minute Maid', 'Tropicana', 'Simply Orange', 'Five Alive', 
    'Ocean Spray', 'Coca-Cola', 'Pepsi', 'Canada Dry', 'Schweppes', 'Mountain Dew',
    'Dr Pepper', '7UP', 'A&W', 'Fanta', 'Crush', 'Sprite', 'Gatorade', 'Powerade',
    'Nestle Pure Life', 'Dasani', 'Aquafina', 'Perrier', 'San Pellegrino', 
    'Evian', 'Voss', 'Fiji', 'Pure Leaf', 'Lipton', 'Arizona', 'Gold Peak', 
    'Snapple', 'Nestea', 'Tetley', 'Twinings', 'Celestial Seasonings', 'Stash',
    'Red Rose', 'Bigelow', 'Tazo', 'Starbucks', 'Tim Hortons', 'McCafe', 
    'Nescafe', 'Maxwell House', 'Folgers', 'Van Houtte', 'Lavazza', 'Illy', 
    'Melitta', 'Club Coffee', 'Kicking Horse', 'Second Cup', 'Bridgehead', 
    'Balzac\'s', 'Keurig', 'Nespresso', 'Green Mountain', 'Donut Shop'
]

def simplify_name(name):
    """Simplifies product names by removing common brand names."""
    for brand in common_brands:
        name = re.sub(r'\b' + re.escape(brand) + r'\b', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+', ' ', name).strip()  # Remove extra spaces
    return name

def parse_weight(title):
    """Extracts weight and unit from the product title."""
    weight_patterns = [
        r'(\d+\.?\d*)\s?(kg|g|lb|oz)',
        r'(\d+)\s?(pack|packs|pcs|pieces|bottles|cans|bags|boxes)'
    ]
    
    for pattern in weight_patterns:
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            return match.groups()
    return None, None

def convert_to_kg(weight, unit):
    """Converts the given weight to kilograms."""
    weight = float(weight)
    if unit == 'g':
        return weight / 1000
    elif unit == 'lb':
        return weight * 0.453592
    elif unit == 'oz':
        return weight * 0.0283495
    elif unit == 'kg':
        return weight
    return None

def process_dataset(input_path, output_path):
    # Load the dataset
    df = pd.read_csv(input_path)
    
    # Simplify product names
    df['SimplifiedName'] = df['Name'].apply(simplify_name)
    
    # Add columns for parsed weight and unit
    df['Weight'] = None
    df['Unit'] = None
    df['Weight_kg'] = None
    
    for index, row in df.iterrows():
        title = row['Name']  # Adjust column name if necessary
        weight, unit = parse_weight(title)
        if weight and unit:
            df.at[index, 'Weight'] = weight
            df.at[index, 'Unit'] = unit
            df.at[index, 'Weight_kg'] = convert_to_kg(weight, unit)
    
    # Remove rows without weight information
    df = df.dropna(subset=['Weight_kg'])
    
    # Save the cleaned data to a new CSV file
    df.to_csv(output_path, index=False)

if __name__ == "__main__":
    input_path = 'data/sobeys.csv'  # Replace with your actual file path
    output_path = 'data/cleaned_sobeys.csv'  # Replace with your desired output file path
    process_dataset(input_path, output_path)