interface Credentials {
  userName: string;
  password: string;
}

// TODO Temp
declare class Acquiring {
  /**
   * @param credentials
   * @param returnUrl - use macro {order} for ID of order
   * @param test - use test entry
   */
  constructor(credentials: Credentials, returnUrl: string, test?: boolean);

  /**
   * Creating new order
   */
  register(
    orderNumber: string,
    amount: number,
    description?: string
  ): Promise<any>;

  /**
   * Checking if order exists and getting its status
   * Provide only one value - for orderId OR for orderNumber
   * @returns  status of the order or null unless it exists
   * !!!  result can be 0 - it is REGISTERED_BUT_NOT_PAID status  !!!
   * !!! always check with '===' whether it is null or isn't null !!!
   */
  status(orderId: string | null, orderNumber?: string): Promise<number | null>;

  /**
   * Get info on order
   * Provide only one value - for orderId OR for orderNumber
   * @param orderId
   * @param orderNumber
   * @returns  response
   */
  get(orderId: string | null, orderNumber?: string): Promise<any>;

  /**
   * Возврат
   * @param orderId Номер заказа в платежной системе.
   * @param amount Сумма платежа (500.23). 0 для возврата на всю сумму.
   * @param jsonParams Дополнительные параметры запроса.
   * @returns response
   */
  refund(orderId: string, amount: number, jsonParams?: object): Promise<any>;

  /**
   * Parse response data
   */
  parse(response: object): any;

  /**
   * Send POST
   */
  POST(action: string, data: object): Promise<any>;

  /**
   * Add technical parameters to data
   */
  buildData(parameters?: object): any;
}

export default Acquiring;
