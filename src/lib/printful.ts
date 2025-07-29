const PRINTFUL_API_URL = 'https://api.printful.com';

export interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
  retail_price?: number;
}

export interface PrintfulVariant {
  id: number;
  name: string;
  retail_price: string;
  files: any[];
}

export class PrintfulAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get all products from Printful
  async getProducts(): Promise<PrintfulProduct[]> {
    console.log('Making request to Printful API...');
    
    // Get products from your store - try sync-products endpoint which should have retail prices
    const response = await fetch(`${PRINTFUL_API_URL}/store/products`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Printful API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Printful API error response:', errorText);
      throw new Error(`Printful API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Printful API response data:', data);
    console.log('Response structure analysis:', {
      hasResult: !!data.result,
      hasProducts: !!data.products,
      isArray: Array.isArray(data),
      resultType: typeof data.result,
      productsType: typeof data.products
    });
    
    // Handle different response structures and extract retail prices from variants
    let products = [];
    if (data.result) {
      console.log('Using data.result:', data.result);
      products = data.result;
    } else if (data.products) {
      console.log('Using data.products:', data.products);
      products = data.products;
    } else if (Array.isArray(data)) {
      console.log('Using data as array:', data);
      products = data;
    } else {
      console.warn('Unexpected API response structure:', data);
      return [];
    }

    // Log the actual product structure to see what we're working with
    console.log('🔍 RAW PRODUCT STRUCTURE:');
    console.log(JSON.stringify(products[0], null, 2));
    console.log('🔍 END RAW PRODUCT STRUCTURE');
    
    // Get detailed product data to extract retail prices from variants
    const productsWithPrices = await Promise.all(products.map(async (product: any) => {
      console.log(`🔍 Getting detailed data for ${product.name}...`);
      
      try {
        // Get detailed product data which includes variants with retail prices
        const detailedProduct = await this.getProductDetails(product.id);
        console.log(`Detailed data for ${product.name}:`, detailedProduct);
        
        // Extract retail price from first variant
        if (detailedProduct.sync_variants && detailedProduct.sync_variants.length > 0) {
          const firstVariant = detailedProduct.sync_variants[0];
          if (firstVariant.retail_price) {
            const retailPrice = parseFloat(firstVariant.retail_price);
            console.log(`✅ Found retail_price for ${product.name}: $${retailPrice}`);
            return {
              ...product,
              retail_price: retailPrice
            };
          }
        }
        
        throw new Error(`No retail_price found in detailed data for ${product.name} (ID: ${product.id})`);
      } catch (error) {
        console.error(`Failed to get detailed data for ${product.name}:`, error);
        throw error;
      }
    }));

    console.log('Products with extracted prices:', productsWithPrices);
    return productsWithPrices;
  }

  // Get specific product details with variants
  async getProductDetails(productId: number): Promise<any> {
    console.log(`Fetching detailed product data for ID: ${productId}`);
    console.log(`API URL: ${PRINTFUL_API_URL}/sync-products/${productId}`);
    
    // Try the sync-products endpoint first
    console.log(`🔍 Trying primary endpoint: ${PRINTFUL_API_URL}/sync-products/${productId}`);
    let response = await fetch(`${PRINTFUL_API_URL}/sync-products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Primary endpoint response status: ${response.status}`);
    let successfulEndpoint = '';
    
    if (response.ok) {
      successfulEndpoint = `/sync-products/${productId}`;
      console.log(`✅ Primary endpoint worked: ${successfulEndpoint}`);
    }

    if (!response.ok) {
      console.log('First endpoint failed, trying alternative endpoints...');
      
      // Try alternative endpoints
      const alternativeEndpoints = [
        { url: `${PRINTFUL_API_URL}/store/products/${productId}`, name: '/store/products/{id}' },
        { url: `${PRINTFUL_API_URL}/products/${productId}`, name: '/products/{id}' },
        { url: `${PRINTFUL_API_URL}/catalog-products/${productId}`, name: '/catalog-products/{id}' }
      ];
      
      for (const endpoint of alternativeEndpoints) {
        console.log(`🔍 Trying alternative endpoint: ${endpoint.name}`);
        try {
          response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            successfulEndpoint = endpoint.name;
            console.log(`✅ Success with endpoint: ${endpoint.name}`);
            break;
          } else {
            console.log(`❌ Failed with endpoint: ${endpoint.name} (${response.status})`);
          }
        } catch (error) {
          console.log(`❌ Error with endpoint: ${endpoint.name}`, error);
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('All product details API endpoints failed:', errorText);
        throw new Error(`Printful API error: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('=== API RESPONSE ANALYSIS ===');
    console.log(`🎯 Successful endpoint: ${successfulEndpoint}`);
    console.log('Full API response:', data);
    console.log('Response code:', data.code);
    console.log('Response result type:', typeof data.result);
    console.log('Response result keys:', data.result ? Object.keys(data.result) : 'null');
    
    return data.result;
  }

  // Create order in Printful
  async createOrder(orderData: {
    recipient: any;
    items: any[];
    retail_costs: {
      currency: string;
      subtotal: string;
      discount: string;
      shipping: string;
      tax: string;
      total: string;
    };
  }) {
    const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Sync product to Stripe
  async syncProductToStripe(printfulProduct: PrintfulProduct, stripeSecretKey: string) {
    const stripe = require('stripe')(stripeSecretKey);

    try {
      console.log('Product data from Printful:', printfulProduct);

      // Get detailed product information including all variants
      let detailedProduct;
      try {
        detailedProduct = await this.getProductDetails(printfulProduct.id);
        console.log('Detailed product data:', detailedProduct);
      } catch (error) {
        console.error('Failed to get detailed product data:', error);
        throw new Error(`Failed to get variants for ${printfulProduct.name}`);
      }

      // Get all variants from the detailed product
      const variants = detailedProduct.sync_variants || detailedProduct.variants || [];
      console.log(`Found ${variants.length} variants for ${printfulProduct.name}`);

      if (variants.length === 0) {
        console.warn(`No variants found for ${printfulProduct.name}, creating single product`);
        // Fall back to creating a single product without variants
        return await this.createSingleStripeProduct(printfulProduct, stripe, 25.00);
      }

      // Create individual Stripe products for each variant
      const createdProducts = [];
      
      for (const variant of variants) {
        if (!variant.is_enabled && variant.is_enabled !== undefined) {
          console.log(`Skipping disabled variant: ${variant.name}`);
          continue;
        }

        const variantPrice = variant.retail_price ? parseFloat(variant.retail_price) : 25.00;
        console.log(`Creating Stripe product for variant: ${variant.name} - $${variantPrice}`);

        const stripeProduct = await this.createVariantStripeProduct(
          printfulProduct,
          variant,
          variantPrice,
          stripe
        );

        createdProducts.push(stripeProduct);
      }

      console.log(`✅ Created ${createdProducts.length} Stripe products for ${printfulProduct.name}`);
      return createdProducts;

    } catch (error) {
      console.error('Error syncing product to Stripe:', error);
      throw error;
    }
  }

  // Helper method to create a single Stripe product (fallback)
  private async createSingleStripeProduct(printfulProduct: PrintfulProduct, stripe: any, price: number) {
    const existingProducts = await stripe.products.list({ limit: 100 });
    const existingProduct = existingProducts.data.find(
      (p: any) => p.metadata?.printful_product_id === printfulProduct.id.toString()
    );

    let product;
    if (existingProduct) {
      product = await stripe.products.update(existingProduct.id, {
        name: printfulProduct.name,
        description: `KSO ${printfulProduct.name}`,
        images: [printfulProduct.thumbnail_url],
        metadata: {
          printful_product_id: printfulProduct.id.toString(),
          printful_sync_product_id: printfulProduct.id.toString(),
          category: 'Apparel',
          last_synced: new Date().toISOString(),
        },
      });
    } else {
      product = await stripe.products.create({
        name: printfulProduct.name,
        description: `KSO ${printfulProduct.name}`,
        images: [printfulProduct.thumbnail_url],
        metadata: {
          printful_product_id: printfulProduct.id.toString(),
          printful_sync_product_id: printfulProduct.id.toString(),
          category: 'Apparel',
          created_from_printful: 'true',
          last_synced: new Date().toISOString(),
        },
      });
    }

    // Create or update price
    const priceId = await this.createOrUpdatePrice(stripe, product.id, price);
    
    return {
      ...product,
      price_id: priceId,
      printful_product_id: printfulProduct.id,
      printful_sync_product_id: printfulProduct.id
    };
  }

  // Helper method to create a Stripe product for a specific variant
  private async createVariantStripeProduct(printfulProduct: PrintfulProduct, variant: any, price: number, stripe: any) {
    const variantName = variant.name || 'Default';
    const productName = `${printfulProduct.name} - ${variantName}`;
    const variantId = variant.id;
    
    // Extract color information if available
    const color = variant.color || variant.color_name || this.extractColorFromName(variantName);

    // Check if this specific variant product already exists
    const existingProducts = await stripe.products.list({ limit: 100 });
    const existingProduct = existingProducts.data.find(
      (p: any) => p.metadata?.printful_variant_id === variantId.toString()
    );

    let product;
    if (existingProduct) {
      // Update existing variant product
      product = await stripe.products.update(existingProduct.id, {
        name: productName,
        description: `KSO ${productName}`,
        images: [printfulProduct.thumbnail_url],
                  metadata: {
            printful_product_id: printfulProduct.id.toString(),
            printful_sync_product_id: printfulProduct.id.toString(),
            printful_variant_id: variantId.toString(),
            variant_name: variantName,
            color: color || '',
            category: 'Apparel',
            last_synced: new Date().toISOString(),
          },
      });
    } else {
      // Create new variant product
      product = await stripe.products.create({
        name: productName,
        description: `KSO ${productName}`,
        images: [printfulProduct.thumbnail_url],
                    metadata: {
              printful_product_id: printfulProduct.id.toString(),
              printful_sync_product_id: printfulProduct.id.toString(),
              printful_variant_id: variantId.toString(),
              variant_name: variantName,
              color: color || '',
              category: 'Apparel',
              created_from_printful: 'true',
              last_synced: new Date().toISOString(),
            },
      });
    }

    // Create or update price for this variant
    const priceId = await this.createOrUpdatePrice(stripe, product.id, price);
    
    return {
      ...product,
      price_id: priceId,
      printful_product_id: printfulProduct.id,
      printful_sync_product_id: printfulProduct.id,
      printful_variant_id: variantId,
      variant_name: variantName
    };
  }

  // Helper method to extract color from variant name
  private extractColorFromName(variantName: string): string {
    // Common color patterns in Printful variant names
    const colorPatterns = [
      /black/i, /white/i, /navy/i, /gray/i, /grey/i, /red/i, /blue/i, /green/i, 
      /yellow/i, /purple/i, /pink/i, /orange/i, /brown/i, /beige/i, /cream/i,
      /maroon/i, /burgundy/i, /olive/i, /teal/i, /turquoise/i, /coral/i
    ];
    
    for (const pattern of colorPatterns) {
      if (pattern.test(variantName)) {
        return variantName.match(pattern)![0];
      }
    }
    
    return '';
  }

  // Helper method to create or update a Stripe price
  private async createOrUpdatePrice(stripe: any, productId: string, price: number) {
    const existingPrices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    const correctAmount = Math.round(price * 100);

    if (existingPrices.data.length > 0) {
      const existingPrice = existingPrices.data[0];
      
      if (existingPrice.unit_amount !== correctAmount) {
        console.log(`Creating new price with correct amount: $${price.toFixed(2)}`);
        
        // Create new price with correct amount
        const newPrice = await stripe.prices.create({
          product: productId,
          unit_amount: correctAmount,
          currency: 'usd',
        });
        
        // Set new price as default
        await stripe.products.update(productId, {
          default_price: newPrice.id,
        });

        return newPrice.id;
      }
      
      return existingPrice.id;
    } else {
      // Create first price
      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: correctAmount,
        currency: 'usd',
      });
      
      // Set as default price
      await stripe.products.update(productId, {
        default_price: newPrice.id,
      });

      return newPrice.id;
    }
  }
}

  // Helper function to get retail price for a product
  export async function getProductRetailPrice(productId: number, apiKey: string): Promise<number> {
    const printfulApi = new PrintfulAPI(apiKey);
    try {
      console.log(`=== Getting retail price for product ${productId} ===`);
      const detailedProduct = await printfulApi.getProductDetails(productId);
      console.log(`Detailed product data for ${productId}:`, JSON.stringify(detailedProduct, null, 2));
      
      // Check different possible structures
      if (detailedProduct.sync_variants && detailedProduct.sync_variants.length > 0) {
        console.log(`Found ${detailedProduct.sync_variants.length} sync_variants`);
        const firstVariant = detailedProduct.sync_variants[0];
        console.log('First variant (sync_variants):', JSON.stringify(firstVariant, null, 2));
        console.log('Available attributes in first variant:', Object.keys(firstVariant));
        
        // Check for different possible price attributes
        if (firstVariant.retail_price) {
          console.log('✅ Found retail_price:', firstVariant.retail_price);
          return parseFloat(firstVariant.retail_price);
        }
        if (firstVariant.price) {
          console.log('✅ Found price:', firstVariant.price);
          return parseFloat(firstVariant.price);
        }
        if (firstVariant.retail) {
          console.log('✅ Found retail:', firstVariant.retail);
          return parseFloat(firstVariant.retail);
        }
        if (firstVariant.retail_price_formatted) {
          console.log('✅ Found retail_price_formatted:', firstVariant.retail_price_formatted);
          // Extract numeric value from formatted string like "$25.00"
          const match = firstVariant.retail_price_formatted.match(/\$?(\d+\.?\d*)/);
          if (match) {
            return parseFloat(match[1]);
          }
        }
      }
      
      // Try alternative structure
      if (detailedProduct.variants && detailedProduct.variants.length > 0) {
        console.log(`Found ${detailedProduct.variants.length} variants`);
        const firstVariant = detailedProduct.variants[0];
        console.log('First variant (variants):', JSON.stringify(firstVariant, null, 2));
        console.log('Available attributes in first variant:', Object.keys(firstVariant));
        
        if (firstVariant.retail_price) {
          console.log('✅ Found retail_price:', firstVariant.retail_price);
          return parseFloat(firstVariant.retail_price);
        }
        if (firstVariant.price) {
          console.log('✅ Found price:', firstVariant.price);
          return parseFloat(firstVariant.price);
        }
        if (firstVariant.retail) {
          console.log('✅ Found retail:', firstVariant.retail);
          return parseFloat(firstVariant.retail);
        }
      }
      
      // Check if there's a direct retail_price on the product
      if (detailedProduct.retail_price) {
        console.log('✅ Found retail_price on product:', detailedProduct.retail_price);
        return parseFloat(detailedProduct.retail_price);
      }
      
      console.log('❌ No retail price found in any structure');
      console.log('Available top-level keys:', Object.keys(detailedProduct));
    } catch (error) {
      console.error(`Failed to get retail price for product ${productId}:`, error);
    }
    return 0.00; // Default price
  }

  // Helper function to sync all products
  export async function syncAllProducts() {
    const printfulApi = new PrintfulAPI(process.env.PRINTFUL_API_KEY!);
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);
    
    console.log('🔄 Starting enhanced sync with cleanup...');
    
    // Get current Printful products
    const printfulProducts = await printfulApi.getProducts();
    console.log(`📦 Found ${printfulProducts.length} products in Printful`);
    
    // Get all Stripe products with printful metadata
    const stripeProducts = await stripe.products.list({ limit: 100 });
    const printfulStripeProducts = stripeProducts.data.filter((p: any) => 
      p.metadata?.printful_product_id || p.metadata?.printful_variant_id || p.metadata?.created_from_printful === 'true'
    );
    
    console.log(`💳 Found ${printfulStripeProducts.length} Printful-synced products in Stripe`);
    
    // Get all current Printful variants for comparison
    const allPrintfulVariants = new Set<string>();
    const allPrintfulProductIds = new Set<string>();
    
    for (const product of printfulProducts) {
      allPrintfulProductIds.add(product.id.toString());
      try {
        const detailedProduct = await printfulApi.getProductDetails(product.id);
        if (detailedProduct.sync_variants) {
          for (const variant of detailedProduct.sync_variants) {
            if (variant.is_enabled !== false) { // Only include enabled variants
              allPrintfulVariants.add(variant.id.toString());
            }
          }
        }
      } catch (error) {
        console.error(`Failed to get variants for product ${product.id}:`, error);
      }
    }
    
    console.log(`📦 Found ${allPrintfulProductIds.size} products and ${allPrintfulVariants.size} variants in Printful`);
    
    // Find products to delete (in Stripe but not in Printful)
    const productsToDelete = printfulStripeProducts.filter((p: any) => {
      const printfulProductId = p.metadata?.printful_product_id;
      const printfulVariantId = p.metadata?.printful_variant_id;
      
      // If it's a variant product, check if the variant still exists
      if (printfulVariantId) {
        return !allPrintfulVariants.has(printfulVariantId);
      }
      
      // If it's a product-level item, check if the product still exists
      if (printfulProductId) {
        return !allPrintfulProductIds.has(printfulProductId);
      }
      
      // If no Printful metadata, don't delete (might be manually created)
      return false;
    });
    
    console.log(`🗑️ Found ${productsToDelete.length} products to delete from Stripe`);
    
    // Delete orphaned Stripe products
    for (const product of productsToDelete) {
      try {
        const printfulProductId = product.metadata?.printful_product_id;
        const printfulVariantId = product.metadata?.printful_variant_id;
        
        if (printfulVariantId) {
          console.log(`🗑️ Deleting Stripe variant: ${product.name} (Printful Variant ID: ${printfulVariantId})`);
        } else {
          console.log(`🗑️ Deleting Stripe product: ${product.name} (Printful Product ID: ${printfulProductId})`);
        }
        
        await stripe.products.del(product.id);
        console.log(`✅ Deleted: ${product.name}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${product.name}:`, error);
      }
    }
    
    // Sync current Printful products to Stripe
    const syncedProducts = [];
    
    for (const product of printfulProducts) {
      try {
        console.log(`📦 Syncing: ${product.name} (ID: ${product.id})`);
        
        // Use the retail_price from the product listing
        if (!product.retail_price) {
          throw new Error(`No retail_price found for product ${product.name}`);
        }
        
        const retailPrice = product.retail_price;
        console.log(`💰 Price for ${product.name}: $${retailPrice}`);
        
        // Create a product object with the price
        const productWithPrice = {
          ...product,
          retail_price: retailPrice
        };
        
        const synced = await printfulApi.syncProductToStripe(productWithPrice, process.env.STRIPE_SECRET_KEY!);
        
        // Add price details for display
        const syncedWithDetails = {
          ...synced,
          priceDetails: {
            amount: retailPrice,
            currency: 'usd',
            formatted: `${retailPrice.toFixed(2)}`
          }
        };
        
        console.log(`✅ Synced: ${product.name} - $${retailPrice}`);
        syncedProducts.push(syncedWithDetails);
      } catch (error) {
        console.error(`❌ Failed to sync ${product.name}:`, error);
      }
    }
    
    console.log(`🎉 Enhanced sync completed!`);
    console.log(`✅ Synced: ${syncedProducts.length} products`);
    console.log(`🗑️ Deleted: ${productsToDelete.length} orphaned products`);
    
    return {
      synced: syncedProducts,
      deleted: productsToDelete.length,
      total: syncedProducts.length
    };
  }

  // Helper function to create Printful order from Stripe checkout
  export async function createPrintfulOrder(orderData: {
    recipient: {
      name: string;
      email: string;
      phone?: string;
      address1: string;
      address2?: string;
      city: string;
      state_code: string;
      country_code: string;
      zip: string;
    };
    items: Array<{
      id: string;
      quantity: number;
    }>;
    external_id: string;
  }) {
    const printfulApi = new PrintfulAPI(process.env.PRINTFUL_API_KEY!);
    
    try {
      console.log('Creating Printful order with data:', orderData);
      
      // Calculate costs (you might want to get these from your Stripe session)
      const retail_costs = {
        currency: 'USD',
        subtotal: '0.00', // Will be calculated by Printful
        discount: '0.00',
        shipping: '0.00', // Will be calculated by Printful
        tax: '0.00', // Will be calculated by Printful
        total: '0.00' // Will be calculated by Printful
      };
      
      // Transform items to Printful format
      // Use sync_variant_id if available (for specific variants), otherwise use sync_product_id
      const printfulItems = orderData.items.map(item => {
        const itemData: any = {
          quantity: item.quantity,
          retail_price: '0.00' // Let Printful calculate this
        };
        
        // If the ID looks like a variant ID (larger number), use sync_variant_id
        // Otherwise, use sync_product_id
        const id = parseInt(item.id);
        if (id > 1000000) { // Variant IDs are typically larger than product IDs
          itemData.sync_variant_id = id;
        } else {
          itemData.sync_product_id = id;
        }
        
        return itemData;
      });
      
      const orderPayload = {
        recipient: orderData.recipient,
        items: printfulItems,
        retail_costs,
        external_id: orderData.external_id
      };
      
      console.log('Printful order payload:', orderPayload);
      
      const result = await printfulApi.createOrder(orderPayload);
      console.log('Printful order created successfully:', result);
      
      return result;
    } catch (error) {
      console.error('Error creating Printful order:', error);
      throw error;
    }
  } 