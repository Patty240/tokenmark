(define-constant CONTRACT_OWNER tx-sender)

;; Error Codes
(define-constant ERR_UNAUTHORIZED u403)
(define-constant ERR_TOKEN_NOT_FOUND u404)
(define-constant ERR_INVALID_METRICS u400)

;; Token Performance Data Structure
(define-map token-performance 
  {token-symbol: (string-ascii 12)} 
  {
    price: uint,
    volume-24h: uint,
    market-cap: uint,
    historical-prices: (list 30 uint)
  }
)

;; Tracked Tokens List
(define-data-var tracked-tokens (list 100 (string-ascii 12)) (list))

;; Private Function: Validate Token Metrics
(define-private (validate-metrics (price uint) (volume uint) (market-cap uint))
  (and (> price u0) (> volume u0) (> market-cap u0))
)

;; Add Token Performance (Only Owner)
(define-public (add-token-performance 
  (token-symbol (string-ascii 12)) 
  (price uint) 
  (volume uint) 
  (market-cap uint)
  (historical-prices (list 30 uint)))
  (begin
    ;; Authorization check
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err ERR_UNAUTHORIZED))
    
    ;; Validate input metrics
    (asserts! (validate-metrics price volume market-cap) (err ERR_INVALID_METRICS))
    
    ;; Add token to tracked list if not already present
    (let ((current-tokens (var-get tracked-tokens)))
      (var-set tracked-tokens 
        (if (is-none (index-of current-tokens token-symbol))
            (unwrap! (as-max-len? (append current-tokens token-symbol) u100) (err ERR_UNAUTHORIZED))
            current-tokens
        )
      )
    )
    
    ;; Store token performance data
    (map-set token-performance 
      {token-symbol: token-symbol}
      {
        price: price,
        volume-24h: volume,
        market-cap: market-cap,
        historical-prices: historical-prices
      }
    )
    
    (ok true)
  )
)

;; Update Token Performance (Only Owner)
(define-public (update-token-performance 
  (token-symbol (string-ascii 12)) 
  (price uint) 
  (volume uint) 
  (market-cap uint)
  (historical-prices (list 30 uint)))
  (begin
    ;; Authorization and existence check
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err ERR_UNAUTHORIZED))
    (asserts! (is-some (map-get? token-performance {token-symbol: token-symbol})) (err ERR_TOKEN_NOT_FOUND))
    
    ;; Validate input metrics
    (asserts! (validate-metrics price volume market-cap) (err ERR_INVALID_METRICS))
    
    ;; Update token performance data
    (map-set token-performance 
      {token-symbol: token-symbol}
      {
        price: price,
        volume-24h: volume,
        market-cap: market-cap,
        historical-prices: historical-prices
      }
    )
    
    (ok true)
  )
)

;; Get Token Performance (Public Read-Only)
(define-read-only (get-token-performance (token-symbol (string-ascii 12)))
  (map-get? token-performance {token-symbol: token-symbol})
)

;; List All Tracked Tokens
(define-read-only (get-all-tokens)
  (var-get tracked-tokens))