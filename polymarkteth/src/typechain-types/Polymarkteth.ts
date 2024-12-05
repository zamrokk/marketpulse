/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export declare namespace Polymarkteth {
  export type BetStruct = {
    id: BigNumberish;
    owner: AddressLike;
    option: string;
    amount: BigNumberish;
  };

  export type BetStructOutput = [
    id: bigint,
    owner: string,
    option: string,
    amount: bigint
  ] & { id: bigint; owner: string; option: string; amount: bigint };
}

export interface PolymarktethInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "FEES"
      | "ODD_DECIMALS"
      | "addressToString"
      | "admin"
      | "bet"
      | "betKeys"
      | "bets"
      | "calculateOdds"
      | "getBetKeys"
      | "getBets"
      | "ping"
      | "resolveResult"
      | "status"
      | "winner"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "Pong"): EventFragment;

  encodeFunctionData(functionFragment: "FEES", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "ODD_DECIMALS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "addressToString",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "admin", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "bet",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "betKeys",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "bets", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "calculateOdds",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getBetKeys",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBets",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "ping", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "resolveResult",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "status", values?: undefined): string;
  encodeFunctionData(functionFragment: "winner", values?: undefined): string;

  decodeFunctionResult(functionFragment: "FEES", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "ODD_DECIMALS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "addressToString",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "admin", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "bet", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "betKeys", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "bets", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "calculateOdds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getBetKeys", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getBets", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ping", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "resolveResult",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "status", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "winner", data: BytesLike): Result;
}

export namespace PongEvent {
  export type InputTuple = [];
  export type OutputTuple = [];
  export interface OutputObject {}
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface Polymarkteth extends BaseContract {
  connect(runner?: ContractRunner | null): Polymarkteth;
  waitForDeployment(): Promise<this>;

  interface: PolymarktethInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  FEES: TypedContractMethod<[], [bigint], "view">;

  ODD_DECIMALS: TypedContractMethod<[], [bigint], "view">;

  addressToString: TypedContractMethod<[_addr: AddressLike], [string], "view">;

  admin: TypedContractMethod<[], [string], "view">;

  bet: TypedContractMethod<
    [selection: string, odds: BigNumberish],
    [bigint],
    "payable"
  >;

  betKeys: TypedContractMethod<[arg0: BigNumberish], [bigint], "view">;

  bets: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, string, string, bigint] & {
        id: bigint;
        owner: string;
        option: string;
        amount: bigint;
      }
    ],
    "view"
  >;

  calculateOdds: TypedContractMethod<
    [option: string, betAmount: BigNumberish],
    [bigint],
    "view"
  >;

  getBetKeys: TypedContractMethod<[], [bigint[]], "view">;

  getBets: TypedContractMethod<
    [betId: BigNumberish],
    [Polymarkteth.BetStructOutput],
    "view"
  >;

  ping: TypedContractMethod<[], [void], "nonpayable">;

  resolveResult: TypedContractMethod<
    [optionResult: string, result: BigNumberish],
    [void],
    "nonpayable"
  >;

  status: TypedContractMethod<[], [bigint], "view">;

  winner: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "FEES"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "ODD_DECIMALS"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "addressToString"
  ): TypedContractMethod<[_addr: AddressLike], [string], "view">;
  getFunction(
    nameOrSignature: "admin"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "bet"
  ): TypedContractMethod<
    [selection: string, odds: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "betKeys"
  ): TypedContractMethod<[arg0: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "bets"
  ): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, string, string, bigint] & {
        id: bigint;
        owner: string;
        option: string;
        amount: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "calculateOdds"
  ): TypedContractMethod<
    [option: string, betAmount: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "getBetKeys"
  ): TypedContractMethod<[], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "getBets"
  ): TypedContractMethod<
    [betId: BigNumberish],
    [Polymarkteth.BetStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "ping"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "resolveResult"
  ): TypedContractMethod<
    [optionResult: string, result: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "status"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "winner"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "Pong"
  ): TypedContractEvent<
    PongEvent.InputTuple,
    PongEvent.OutputTuple,
    PongEvent.OutputObject
  >;

  filters: {
    "Pong()": TypedContractEvent<
      PongEvent.InputTuple,
      PongEvent.OutputTuple,
      PongEvent.OutputObject
    >;
    Pong: TypedContractEvent<
      PongEvent.InputTuple,
      PongEvent.OutputTuple,
      PongEvent.OutputObject
    >;
  };
}
