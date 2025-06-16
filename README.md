# ail-dev

1. Document Processing:

    A. Upload PDFs

    B. Use pdf-parse to extract text

    C. Use @xenova/transformers to generate embeddings/vectors

    D. Store documents in Cloudinary

    E. Store metadata and vectors in PostgreSQL (aildb table)

2. Search Flow:

    - User types query in dod-deliverables.tsx

    - Query text is converted to vector using @xenova/transformers

    - Send vector to /api/semantic-search

    - PostgreSQL finds similar documents using vector similarity

    - Display results to user

NOTE:

Dimensions (In Simple Terms) Think of dimensions like describing a point in space:

2 dimensions = point on a flat paper (x, y)

3 dimensions = point in a room (x, y, z)

384 dimensions = describing text in 384 different ways

When we convert text to vectors, each dimension represents a different aspect of the text's meaning. More dimensions = more detailed understanding, like describing a painting with 384 different characteristics instead of just 3 (color, size, style).
