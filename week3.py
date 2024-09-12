def calculate_discount(price, discount_percent):
    if discount_percent >= 20:
        discount_amount = price * (discount_percent / 100)
        final_price = price - discount_amount
        return final_price
    else:
        return price

# Prompt user for input
original_price = float(input("28566666: "))
discount_percent = float(input("2percent: "))

# Calculate and print the final price
final_price = calculate_discount(original_price, discount_percent)
print("The final price is:", final_price)